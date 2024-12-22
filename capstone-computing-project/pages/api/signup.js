import crypto from 'crypto';
import db from '../../db.js';
import bcrypt from 'bcrypt';
let APP_URL = process.env.NEXT_PUBLIC_APP_URL;
import 'dotenv/config';
import nodemailer from 'nodemailer';



const signup = async (req, res) => {
    console.log('entered signup')
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    let { email, password, fname, lname, cwid, phone, gradYear, major, pfpimage } = req.body;

    // check if email is using + symbol trick just before @
    // this one isn't complex, should refine this
    // prevents scripting accounts with + symbol trick
    // ENABLE THESE AGAIN
    for (let i = 0; i < email.length; i++) {
        if (email[i] === '+' && !isNaN(email[i + 1])) {
            return res.status(400).json({ message: 'Invalid email' });
        }
    }

    if (!email.endsWith('.ua.edu')) {
        return res.status(400).json({ message: 'Only .ua.edu emails are allowed to sign up.' });
    }

    try {
        const [existingUsers] = await db.query('SELECT * FROM User WHERE Email = ?', [email]);
    
        if (existingUsers && existingUsers.length > 0) {
            console.log('User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        const imageBuffer = pfpimage ? Buffer.from(pfpimage, 'base64') : null;
    
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationURL = `${APP_URL}/api/verify?token=${verificationToken}`;

    
        await db.query(
            `INSERT INTO User (Email, Password, Fname, Lname, CWID, Phone, GradYear, Major, PfpImage, VerificationToken, isAdminVerified) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
            [email, hashedPassword, fname, lname, cwid, phone, gradYear, major, imageBuffer, verificationToken]
        );
        console.log('User inserted into the database');
    
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        console.log('Sending verification email to', email);
        const mailOptions = {
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: 'UA Waterski Team | Verify Your Email for Account Creation',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h3 style="color: #9E1B32; margin-bottom: 20px;">Hello,</h3>
                    <p style="font-size: 16px; line-height: 1.5;">
                        Thank you for signing up with the University of Alabama's Waterski Team! To complete your registration, please verify your email address by clicking the link below:
                    </p>
                    <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #9E1B32; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <a href="${verificationURL}" style="display: inline-block; padding: 10px 20px; background-color: #9E1B32; color: #fff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 5px;">
                            Verify Email
                        </a>
                    </div>
                    <p style="font-size: 16px; line-height: 1.5;">
                        If you didn’t create this account, please ignore this email.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; margin-top: 20px;">
                        Best regards,<br>
                        <span style="font-weight: bold; color: #9E1B32;">UA's Waterski Team</span>
                    </p>
                    <hr style="border: none; border-top: 1px solid #9E1B32; margin-top: 30px;"/>
                    <p style="font-size: 12px; color: #777;">
                        This email was sent from <strong>UA’s Waterski Team</strong>. You can visit our website at 
                        <a href="https://www.uawaterski.com/" style="color: #9E1B32; text-decoration: none;">https://www.uawaterski.com/</a>.
                    </p>
                </div>
            `,

        };

        const mailOptionsForConfirmingUserRegistration = {
            from: process.env.GMAIL_EMAIL,
            to: process.env.GMAIL_EMAIL,
            subject: 'UA Waterski Team | Confirm User Registration',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h3 style="color: #9E1B32; margin-bottom: 20px;">Hello Admin,</h3>
                    <p style="font-size: 16px; line-height: 1.5;">
                        Below is a link to confirm the registration of a new user:
                    </p>
                    <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #9E1B32; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <a href="https://www.uawaterski.com/login-page?redirect=/officer-resources-page" style="display: inline-block; padding: 10px 20px; background-color: #9E1B32; color: #fff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 5px;">
                            Confirm User Registration
                        </a>
                    </div>
                    <p style="font-size: 16px; line-height: 1.5;">
                        The user cannot login until the admin has confirmed and finalized their registration! Please make sure to be haste in your confirmation so as the user can access important features of the website.
                    </p>

                    <p style="font-size: 16px; line-height: 1.5;">
                        Steps to confirm the registration:
                        <ol>
                            <li>Login with admin account</li>
                            <li>Click on Manage Members while on Officer Resources page</li>
                            <li>Click on Confirm Member Registration button</li>
                            <li>Accept or Deny an account registration with the corresponding action buttons</li>
                            <li>Click on Roster page button and Click Edit if you need to edit user's information</li>
                        </ol>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #9E1B32; margin-top: 30px;"/>
                    <p style="font-size: 12px; color: #777;">
                        This email was sent from <strong>UA’s Waterski Team</strong>. You can visit our website at 
                        <a href="https://www.uawaterski.com/" style="color: #9E1B32; text-decoration: none;">https://www.uawaterski.com/</a>.
                    </p>
                </div>
            `,
        };

        // personal note: that link works on localhost, just saving it before i attempt to do this for deployment
        // http://localhost:3000/login-page?redirect=/officer-resources-page

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent');

        await transporter.sendMail(mailOptionsForConfirmingUserRegistration);
        console.log('User registration confirmation email sent to admin email');
    
        res.status(201).json({ message: 'Signup successful! Please check your email to verify your account.' });
    } catch (error) {
        console.error('Error during signup:', error.message, error.stack);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }    
    
};

export default signup;
