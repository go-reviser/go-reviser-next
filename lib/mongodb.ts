const mongoose = await import('mongoose');

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
}

const connection: { isConnected?: number } = {};

export async function connectToDatabase() {
    if (connection.isConnected) {
        console.log('Coonection already there');
        return;
    }

    console.log(MONGODB_URI);


    const db = await mongoose.connect(MONGODB_URI);

    connection.isConnected = db.connections[0].readyState;

    console.log("Connection Established!!");
    return;
}