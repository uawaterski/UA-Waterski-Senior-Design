
// this version fixes the db connection issue, switched over to using mysql.createPool
import 'dotenv/config'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../db.js';
import csrf from 'csrf';


const tokens = new csrf();

//const csrfMiddleware = csrfProtection();

const login = async (req, res) => {

    const csrfToken = req.headers['csrf-token'];

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, password } = req.body;
    console.log('req.body for login:', req.body);


    // Validate the CSRF token
    if (!tokens.verify(process.env.JWT_SECRET, csrfToken)) {
        return res.status(403).json({ message: 'Invalid CSRF token' }); // Reject if invalid
    }

    try {
        const [results] = await db.query('SELECT * FROM User WHERE Email = ?', [email]);

        if (results.length === 0) {
            return res.status(400).json({ message: 'User not found' });
        }

        const user = results[0];
        const validPassword = await bcrypt.compare(password, user.Password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password or email' });
        }

        const token = jwt.sign(
            { id: user.CWID, email: user.Email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Unexpected error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
//});
};

export default login;
