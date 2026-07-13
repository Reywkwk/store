const firebaseConfig = {
    apiKey: "AIzaSyCe_GZ0Ex5Mz4XwcRJWgZUfj-LIB-zINec",
    authDomain: "rey-market-52cb3.firebaseapp.com",
    projectId: "rey-market-52cb3",
    storageBucket: "rey-market-52cb3.firebasestorage.app",
    messagingSenderId: "808512819013",
    appId: "1:808512819013:web:c3de66ce1a9324cb1e782c"
};

let db, auth, firebaseReady = false;
try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    firebaseReady = true;
} catch(e) {
    console.warn("Firebase gagal init:", e);
}

window._fb = {
    ready: () => firebaseReady,
    saveProduct: async (product) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("products").doc(String(product.id)).set(product);
            return true;
        } catch(e) { console.warn("FB saveProduct:", e); return false; }
    },
    deleteProduct: async (id) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("products").doc(String(id)).delete();
            return true;
        } catch(e) { console.warn("FB deleteProduct:", e); return false; }
    },
    listenProducts: (callback) => {
        if (!firebaseReady) return;
        db.collection("products").orderBy("id").onSnapshot((snap) => {
            const arr = [];
            snap.forEach(d => arr.push(d.data()));
            callback(arr);
        }, (err) => {
            // Jika orderBy gagal (index belum ada), coba tanpa orderBy
            db.collection("products").onSnapshot((snap) => {
                const arr = [];
                snap.forEach(d => arr.push(d.data()));
                arr.sort((a,b) => (a.id||0)-(b.id||0));
                callback(arr);
            });
        });
    },
    saveReview: async (review) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("reviews").doc(String(review.id)).set(review);
            return true;
        } catch(e) { console.warn("FB saveReview:", e); return false; }
    },
    deleteReview: async (id) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("reviews").doc(String(id)).delete();
            return true;
        } catch(e) { console.warn("FB deleteReview:", e); return false; }
    },
    listenReviews: (callback) => {
        if (!firebaseReady) return;
        db.collection("reviews").onSnapshot((snap) => {
            const arr = [];
            snap.forEach(d => arr.push(d.data()));
            arr.sort((a,b) => (b.date||'') > (a.date||'') ? 1 : -1);
            callback(arr);
        }, (err) => { console.warn("FB listenReviews:", err); });
    },
    saveNotification: async (notif) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("notifications").doc(String(notif.id)).set(notif);
            return true;
        } catch(e) { console.warn("FB saveNotification:", e); return false; }
    },
    listenNotifications: (userId, callback) => {
        if (!firebaseReady) return;
        db.collection("notifications").where("userId","==",userId).onSnapshot((snap) => {
            const arr = [];
            snap.forEach(d => arr.push(d.data()));
            arr.sort((a,b) => (b.time||'') > (a.time||'') ? 1 : -1);
            callback(arr);
        }, (err) => { console.warn("FB listenNotifications:", err); });
    },
    saveUser: async (user) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("users").doc(String(user.uid)).set(user, {merge: true});
            return true;
        } catch(e) { console.warn("FB saveUser:", e); return false; }
    },
    getUser: async (uid) => {
        if (!firebaseReady) return null;
        try {
            const doc = await db.collection("users").doc(String(uid)).get();
            return doc.exists ? doc.data() : null;
        } catch(e) { console.warn("FB getUser:", e); return null; }
    },
    listenAllUsers: (callback) => {
        if (!firebaseReady) return null;
        try {
            return db.collection("users").onSnapshot((snap) => {
                const arr = [];
                snap.forEach(d => arr.push({uid: d.id, ...d.data()}));
                arr.sort((a,b) => (b.createdAt||'') > (a.createdAt||'') ? 1 : -1);
                callback(arr);
            }, (err) => { console.warn("FB listenAllUsers:", err); });
        } catch(e) { console.warn("FB listenAllUsers error:", e); return null; }
    },
    sendChatMsg: async (msg) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("chats").doc(String(msg.id)).set(msg);
            return true;
        } catch(e) { console.warn("FB sendChatMsg:", e); return false; }
    },
    listenChat: (roomId, callback) => {
        if (!firebaseReady) return null;
        try {
            return db.collection("chats")
                .where("roomId", "==", roomId)
                .orderBy("time", "asc")
                .onSnapshot((snap) => {
                    const arr = [];
                    snap.forEach(d => arr.push(d.data()));
                    callback(arr);
                }, (err) => {
                    // Fallback tanpa orderBy jika index belum siap
                    return db.collection("chats")
                        .where("roomId", "==", roomId)
                        .onSnapshot((snap2) => {
                            const arr = [];
                            snap2.forEach(d => arr.push(d.data()));
                            arr.sort((a,b) => (a.time||'') > (b.time||'') ? 1 : -1);
                            callback(arr);
                        });
                });
        } catch(e) { console.warn("FB listenChat:", e); return null; }
    },
    deleteChatMsg: async (id) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("chats").doc(String(id)).delete();
            return true;
        } catch(e) { return false; }
    },
    listenAllRooms: (callback) => {
        if (!firebaseReady) return null;
        try {
            return db.collection("chatRooms").onSnapshot((snap) => {
                const arr = [];
                snap.forEach(d => arr.push(d.data()));
                arr.sort((a,b) => (b.lastTime||'') > (a.lastTime||'') ? 1 : -1);
                callback(arr);
            }, (err) => { console.warn("FB listenAllRooms:", err); });
        } catch(e) { console.warn("FB listenAllRooms error:", e); return null; }
    },
    createChatRoom: async (room) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("chatRooms").doc(String(room.roomId)).set(room, {merge: true});
            return true;
        } catch(e) { console.warn("FB createChatRoom:", e); return false; }
    },
    saveOrder: async (order) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("orders").doc(String(order.id)).set(order);
            return true;
        } catch(e) { console.warn("FB saveOrder:", e); return false; }
    },
    updateOrder: async (orderId, data) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("orders").doc(String(orderId)).update(data);
            return true;
        } catch(e) { console.warn("FB updateOrder:", e); return false; }
    },
    listenAllOrders: (callback) => {
        if (!firebaseReady) return;
        db.collection("orders").onSnapshot((snap) => {
            const arr = [];
            snap.forEach(d => arr.push(d.data()));
            arr.sort((a,b) => (b.date||'') > (a.date||'') ? 1 : -1);
            callback(arr);
        });
    },
    listenUserOrders: (uid, callback) => {
        if (!firebaseReady) return;
        db.collection("orders").where("uid","==",uid).onSnapshot((snap) => {
            const arr = [];
            snap.forEach(d => arr.push(d.data()));
            arr.sort((a,b) => (b.date||'') > (a.date||'') ? 1 : -1);
            callback(arr);
        });
    },
    saveUserNotification: async (notifId, notif) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("userNotifications").doc(notifId).set({
                ...notif, timestamp: new Date()
            });
            return true;
        } catch(e) { console.warn("FB saveUserNotif:", e); return false; }
    },
    listenUnreadNotifications: (uid, callback) => {
        if (!firebaseReady) return;
        db.collection("userNotifications").where("uid","==",uid).where("read","==",false).onSnapshot((snap) => {
            const arr = [];
            snap.forEach(d => arr.push(d.data()));
            callback(arr);
        });
    },
    saveReseller: async (reseller) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("resellers").doc(String(reseller.uid)).set(reseller, {merge: true});
            return true;
        } catch(e) { console.warn("FB saveReseller:", e); return false; }
    },
    getReseller: async (uid) => {
        if (!firebaseReady) return null;
        try {
            const doc = await db.collection("resellers").doc(String(uid)).get();
            return doc.exists ? doc.data() : null;
        } catch(e) { console.warn("FB getReseller:", e); return null; }
    },
    deleteReseller: async (uid) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("resellers").doc(String(uid)).delete();
            return true;
        } catch(e) { console.warn("FB deleteReseller:", e); return false; }
    },
    listenAllResellers: (callback) => {
        if (!firebaseReady) return;
        db.collection("resellers").onSnapshot((snap) => {
            const arr = [];
            snap.forEach(d => arr.push(d.data()));
            callback(arr);
        });
    },
    saveResellerSale: async (sale) => {
        if (!firebaseReady) return false;
        try {
            await db.collection("resellerSales").doc(String(sale.id)).set(sale);
            return true;
        } catch(e) { console.warn("FB saveResellerSale:", e); return false; }
    },
    listenResellerSales: (uid, callback) => {
        if (!firebaseReady) return;
        db.collection("resellerSales").where("resellerUid","==",uid).onSnapshot((snap) => {
            const arr = [];
            snap.forEach(d => arr.push(d.data()));
            callback(arr);
        });
    }
};

// Fungsi untuk cek apakah user adalah admin
async function checkIsAdmin(uid) {
    if (!firebaseReady) return false;
    try {
        const doc = await db.collection("admins").doc(String(uid)).get();
        return doc.exists;
    } catch(e) {
        console.warn("checkIsAdmin error:", e);
        return false;
    }
}
