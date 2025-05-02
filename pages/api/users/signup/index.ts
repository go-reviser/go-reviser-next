import { connectToDatabase } from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('received response');
    
    try {
        console.log('database checking');
        await connectToDatabase();
        console.log('database checked');
        
    } catch (err) {
        return res.status(500).json({'msg': err})
    }

    return res.status(200).json({'msg': 'Route setup done'});
}