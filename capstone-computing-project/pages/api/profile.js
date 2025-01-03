import dotenv from 'dotenv';
import express from 'express';
import db from '../../db.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const router = express.Router();

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Unauthorized, no token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden, invalid token' });
        }
        req.user = user;
        next();
    });
};

const profileHandler = async (req, res) => {
    try {
        const { email } = req.user; // get email from decoded token

        const [results] = await db.query(
            'SELECT Fname, Lname, GradYear, MemberType, Major, Phone, Email, CWID, SlalomDriver, TrickDriver, JumpDriver, PfpImage FROM User WHERE Email = ?', 
            [email]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        let user = results[0];

        if (user.PfpImage) {
            const base64Image = user.PfpImage.toString('base64');
            user.PfpImage = `data:image/png;base64,${base64Image}`;
        }

        res.status(200).json(user); // returns the user data
    } catch (error) {
        console.error("Error in profile handler:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

const handler = (req, res) => {
    authenticateJWT(req, res, () => profileHandler(req, res));
};

export default handler; 
