"use client";
import { Suspense, useEffect, useState } from 'react';
import Select from 'react-select';
import axios, { AxiosError } from 'axios';
import { useRouter, useSearchParams } from 'next/navigation'; 
import Image from 'next/image';
import WaterskiImage from '../img/loginSkiIMG.svg';
import SkiBamaLogo from '../img/skibamalogo.svg';
import dynamic from 'next/dynamic';

let APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// list of majors offered by UA, think we should take out minors for now. our database only holds one major, but ppl can have multiple as well.
const majors = [
    { value: 'Accounting, BS', label: 'Accounting, BS' },
    { value: 'Accounting, MMA', label: 'Accounting, MMA' },
    { value: 'Accounting, Ph.D.', label: 'Accounting, Ph.D.' },
    { value: 'Addiction and Recovery, BS', label: 'Addiction and Recovery, BS' },
    { value: 'Advertising and Public Relations, MA', label: 'Advertising and Public Relations, MA' },
    { value: 'Advertising, BA', label: 'Advertising, BA' },
    { value: 'Aerospace Engineering and Mechanics, MS', label: 'Aerospace Engineering and Mechanics, MS' },
    { value: 'Aerospace Engineering and Mechanics, Ph.D.', label: 'Aerospace Engineering and Mechanics, Ph.D.' },
    { value: 'Aerospace Engineering, BS', label: 'Aerospace Engineering, BS' },
    { value: 'African American Studies, BA', label: 'African American Studies, BA' },
    { value: 'American Studies, BA', label: 'American Studies, BA' },
    { value: 'American Studies, MA', label: 'American Studies, MA' },
    { value: 'Anthropology, BA', label: 'Anthropology, BA' },
    { value: 'Anthropology, MA', label: 'Anthropology, MA' },
    { value: 'Apparel and Textiles, BS', label: 'Apparel and Textiles, BS' },
    { value: 'Applied Liberal Arts and Sciences, BA', label: 'Applied Liberal Arts and Sciences, BA' },
    { value: 'Applied Mathematics, PhD', label: 'Applied Mathematics, PhD' },
    { value: 'Applied Statistics, MS', label: 'Applied Statistics, MS' },
    { value: 'Applied Statistics, Ph.D.', label: 'Applied Statistics, Ph.D.' },
    { value: 'Architectural Engineering, BS', label: 'Architectural Engineering, BS' },
    { value: 'Art History, BA', label: 'Art History, BA' },
    { value: 'Art History, MA', label: 'Art History, MA' },
    { value: 'Athletic Training, MS', label: 'Athletic Training, MS' },
    { value: 'Biology, BS', label: 'Biology, BS' },
    { value: 'Biological Sciences, MA', label: 'Biological Sciences, MA' },
    { value: 'Biology, MS', label: 'Biology, MS' },
    { value: 'Biology, Ph.D.', label: 'Biology, Ph.D.' },
    { value: 'Business Administration, MBA', label: 'Business Administration, MBA' },
    { value: 'Business Analytics, MSBA', label: 'Business Analytics, MSBA' },
    { value: 'Business Cyber Security, BS', label: 'Business Cyber Security, BS' },
    { value: 'Chemical Engineering, BSChE', label: 'Chemical Engineering, BSChE' },
    { value: 'Chemical Engineering, MS', label: 'Chemical Engineering, MS' },
    { value: 'Chemical Engineering, Ph.D.', label: 'Chemical Engineering, Ph.D.' },
    { value: 'Chemistry, BCH', label: 'Chemistry, BCH' },
    { value: 'Chemistry, BS', label: 'Chemistry, BS' },
    { value: 'Chemistry, MSC', label: 'Chemistry, MSC' },
    { value: 'Chemistry, Ph.D.', label: 'Chemistry, Ph.D.' },
    { value: 'Civil Engineering, BS', label: 'Civil Engineering, BS' },
    { value: 'Civil Engineering, MS', label: 'Civil Engineering, MS' },
    { value: 'Civil Engineering, Ph.D.', label: 'Civil Engineering, Ph.D.' },
    { value: 'Communication & Information Sciences (CIS), PhD', label: 'Communication & Information Sciences (CIS), PhD' },
    { value: 'Communication Studies, BAC', label: 'Communication Studies, BAC' },
    { value: 'Communication Studies, MA', label: 'Communication Studies, MA' },
    { value: 'Computer Engineering, BS', label: 'Computer Engineering, BS' },
    { value: 'Computer Science, BS', label: 'Computer Science, BS' },
    { value: 'Computer Science, MS', label: 'Computer Science, MS' },
    { value: 'Computer Science, Ph.D.', label: 'Computer Science, Ph.D.' },
    { value: 'Cyber Security, BS', label: 'Cyber Security, BS' },
    { value: 'Dance, BA', label: 'Dance, BA' },
    { value: 'Dance, MFA', label: 'Dance, MFA' },
    { value: 'Data Science, BS', label: 'Data Science, BS' },
    { value: 'Doctor of Nursing Practice (DNP)', label: 'Doctor of Nursing Practice (DNP)' },
    { value: 'Early Childhood Education, BS', label: 'Early Childhood Education, BS' },
    { value: 'Economics, BA', label: 'Economics, BA' },
    { value: 'Economics, BS', label: 'Economics, BS' },
    { value: 'Educational Leadership, Ed.D.', label: 'Educational Leadership, Ed.D.' },
    { value: 'Electrical Engineering, BS', label: 'Electrical Engineering, BS' },
    { value: 'Electrical Engineering, MS', label: 'Electrical Engineering, MS' },
    { value: 'Electrical Engineering, Ph.D.', label: 'Electrical Engineering, Ph.D.' },
    { value: 'Elementary Education, BSE', label: 'Elementary Education, BSE' },
    { value: 'English, BA', label: 'English, BA' },
    { value: 'English, MA', label: 'English, MA' },
    { value: 'Environmental Engineering, BS', label: 'Environmental Engineering, BS' },
    { value: 'Environmental Science, BS', label: 'Environmental Science, BS' },
    { value: 'Finance, BS', label: 'Finance, BS' },
    { value: 'Finance, MS', label: 'Finance, MS' },
    { value: 'Finance, Ph.D.', label: 'Finance, Ph.D.' },
    { value: 'Food and Nutrition, BS', label: 'Food and Nutrition, BS' },
    { value: 'Foreign Languages and Literature, BA', label: 'Foreign Languages and Literature, BA' },
    { value: 'General Business, BS', label: 'General Business, BS' },
    { value: 'Geography, BA', label: 'Geography, BA' },
    { value: 'Geography, BS', label: 'Geography, BS' },
    { value: 'Geology, BA', label: 'Geology, BA' },
    { value: 'Geology, BS', label: 'Geology, BS' },
    { value: 'History, BA', label: 'History, BA' },
    { value: 'History, MA', label: 'History, MA' },
    { value: 'Hospitality Management, BS', label: 'Hospitality Management, BS' },
    { value: 'Human Development and Family Studies, BS', label: 'Human Development and Family Studies, BS' },
    { value: 'Human Nutrition, MS', label: 'Human Nutrition, MS' },
    { value: 'Kinesiology, BS', label: 'Kinesiology, BS' },
    { value: 'Marine Science, BS', label: 'Marine Science, BS' },
    { value: 'Marketing, BS', label: 'Marketing, BS' },
    { value: 'Mathematics, BS', label: 'Mathematics, BS' },
    { value: 'Mechanical Engineering, BS', label: 'Mechanical Engineering, BS' },
    { value: 'Nursing, BSN', label: 'Nursing, BSN' },
    { value: 'Philosophy, BA', label: 'Philosophy, BA' },
    { value: 'Physics, BS', label: 'Physics, BS' },
    { value: 'Political Science, BA', label: 'Political Science, BA' },
    { value: 'Psychology, BA', label: 'Psychology, BA' },
    { value: 'Public Health, BS', label: 'Public Health, BS' },
    { value: 'Social Work, BSW', label: 'Social Work, BSW' },
    { value: 'Sociology, BA', label: 'Sociology, BA' },
    { value: 'Spanish, BA', label: 'Spanish, BA' },
    { value: 'Theatre, BA', label: 'Theatre, BA' },
    { value: 'Women\'s Studies, BA', label: 'Women\'s Studies, BA' },
];

// used to have export default function LoginPage() 
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [cwid, setCwid] = useState('');
    const [phone, setPhone] = useState('');
    const [gradYear, setGradYear] = useState('Freshman');
    const [selectedMajor, setSelectedMajor] = useState<{ value: string, label: string } | null>(null);
    const [PfpImage, setProfilePicture] = useState<File | null>(null);
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    // const redirect = searchParams.get('redirect') || '/';
    const redirect = searchParams ? searchParams.get('redirect') || '/' : '/'; // vercel complained about searh param null


    // below useEffect is not in use, we switched to searchParams 
    // useEffect(() => {
    //     if (router.isReady) {
    //         console.log('Router query:', router.query); 
    //         const redirect = router.query?.redirect as string;
    //         console.log('Redirect path:', redirect);
    //         setRedirectPath(redirect || '/');
    //     } else {
    //         console.log('that didnt work bruh why are u even coding at this point');
    //     }
    // }, [router.isReady, router.query]);

    useEffect(() => {
        document.title = 'UA Waterski - Login/Sign Up';
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert("File size exceeds 4 MB limit. Please choose a smaller image.");
                return;
            }

            const img = new window.Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                if (img.width > 1536 || img.height > 1536) {
                    alert("Image dimensions exceed 1536 x 1536 pixels. Please choose a smaller image.");
                } else {
                    setProfilePicture(file);
                }
            };
        }
    };

    //listens to our subomains for endpoint
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        if (email === "skibama18@gmail.com" && password === "test") {
            console.log("valid email");
            try {

                if (
                    window.location.host.includes("brian") ||
                    window.location.host.includes("lilly") ||
                    window.location.host.includes("brooke") ||
                    window.location.host.includes("anastasia")
                ) {
                    const host = window.location.host;
                    const baseDomain = "uawaterski.com";

                    if (host !== `www.${baseDomain}` && host.endsWith(baseDomain)) {
                        APP_URL = `https://${host}/`;
                    }

                    // console.log("Current APP_URL:", APP_URL);
                } else {
                    console.log("oops you coded wrong, what a dummy");
                }

                const response = await axios.post(`${APP_URL}api/login`, { email, password }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                localStorage.setItem('token', response.data.token);

                console.log("Redirecting to:", redirect as string);

                router.push(redirect || '/');
                return; 
            } catch (error) {
                let errorMessage = "An unexpected error occurred.";
                if (axios.isAxiosError(error)) {
                    errorMessage = error.response?.data?.message || error.message;
                }
                console.error('Error:', errorMessage);
                document.getElementById('errorBox')?.setAttribute("style", "display: block;");
                document.getElementById('errorText')!.innerText = errorMessage;
                return; 
            }
        }
    
        if (!email.match(/.+@+(.+\.)?ua\.edu$/)) {
            document.getElementById('errorBox')?.setAttribute("style", "display: block;");
            document.getElementById('errorText')!.innerText = "Email must be a valid University of Alabama address (i.e., ending in ua.edu).";
            return; 
        }
    
        const endpoint = isLogin ? `${APP_URL}api/login` : `${APP_URL}api/signup`;
    
        let pfpBase64 = null;
        if (PfpImage && !isLogin) {
            const reader = new FileReader();
            pfpBase64 = await new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result?.toString().split(",")[1]);
                reader.onerror = reject;
                reader.readAsDataURL(PfpImage);
            });
        }
        const payload = isLogin
            ? { email, password }
            : { email, password, fname, lname, cwid, phone, gradYear, major: selectedMajor?.value || '', pfpimage: pfpBase64 };
    
        try {
            const response = await axios.post(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (isLogin) {
                localStorage.setItem('token', response.data.token);
                router.push(redirect as string);
            } else {
                setIsLogin(true);
            }
        } catch (error) {
            let errorMessage = "An unexpected error occurred.";
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            }
            console.error('Error:', errorMessage);
            document.getElementById('errorBox')?.setAttribute("style", "display: block;");
            document.getElementById('errorText')!.innerText = errorMessage;
        }
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className='login-page flex items-center justify-center min-h-screen bg-[#ffffff]'>
                <div className="flex flex-row w-full h-full">
                    <div className="w-full md:w-2/3 flex flex-col justify-center items-center pr-0">
                        <div className="mb-8" style={{ height: 'auto', width: '300px' }}>
                            <Image src={SkiBamaLogo} alt="Ski Bama Logo" />
                        </div>

                        <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-black mt-[-40px]'>

                            <div className='bg-[#ffaaaa] rounded-lg p-2 mt-2 mb-2 hidden' id="errorBox">
                                <p className='font-bold'>Error:</p><p id="errorText">DEFAULT ERROR TEXT</p>
                            </div>

                            <div className='flex justify-between mb-4'>
                                <button
                                    onClick={() => setIsLogin(true)}
                                    className={`w-1/2 mr-1 py-2 rounded-l-full font-bold ${isLogin ? 'bg-[#9E1B32] text-white' : 'bg-gray-200 text-[#9E1B32]'}`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setIsLogin(false)}
                                    className={`w-1/2 ml-1 py-2 rounded-r-full font-bold ${!isLogin ? 'bg-[#9E1B32] text-white' : 'bg-gray-200 text-[#9E1B32]'}`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    // pattern=".+@+(.+\.)?ua\.edu"
                                    title="Email must be a valid University of Alabama address (i.e. ending in ua.edu)"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e1b32]"
                                    required
                                />
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e1b32]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.95 10.95 0 0112 20c-5.523 0-10-4.477-10-10 0-1.326.255-2.593.72-3.757" />
                                                <path d="M3.6 3.6l16.8 16.8" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="3" />
                                                <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {!isLogin && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            value={fname}
                                            onChange={(e) => setFname(e.target.value)}
                                            className="col-span-2 md:col-span-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e1b32]"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            value={lname}
                                            onChange={(e) => setLname(e.target.value)}
                                            className="col-span-2 md:col-span-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e1b32]"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="CWID"
                                            value={cwid}
                                            onChange={(e) => setCwid(e.target.value)}
                                            className="col-span-2 md:col-span-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e1b32]"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Phone Number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="col-span-2 md:col-span-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e1b32]"
                                            required
                                        />
                                        <div className="col-span-2">
                                            <select
                                                value={gradYear}
                                                onChange={(e) => setGradYear(e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9e1b32]"
                                                required
                                            >
                                                <option value="Freshman">Freshman</option>
                                                <option value="Sophomore">Sophomore</option>
                                                <option value="Junior">Junior</option>
                                                <option value="Senior">Senior</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <Select
                                                placeholder="Select your Major"
                                                value={selectedMajor}
                                                onChange={setSelectedMajor}
                                                options={majors}
                                                className="w-full"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="w-full cursor-pointer border-2 border-[#9e1b32] rounded-lg p-2 flex justify-between items-center">
                                                <span className="text-gray-700">Upload Profile Picture</span>
                                                <input
                                                    type="file"
                                                    accept=".png, .jpg, .jpeg, .webp"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            {PfpImage && <span className="ml-2 text-gray-600">{PfpImage.name}</span>}
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="w-full bg-[white] text-[black] py-2 rounded-full font-bold hover:text-[#9E1B32]">
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                </button>
                            </form>

                            {isLogin && (
                                <p className='text-center mt-4 text-xs'>
                                    <a href='/forgot-password-page' className='text-[black] hover:text-[#9E1B32] font-bold'>
                                        Forgot Password?
                                    </a>
                                </p>
                            )}
                        </div>

                    </div>

                    <div className="hidden md:block rounded-tl-[55px] rounded-bl-[55px] relative" style={{ maxWidth: '100%', height: 'auto' }}>
                        <Image
                            src={WaterskiImage}
                            alt="Water ski image"
                            priority={true}
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

// export default LoginPage;


const LoginPageContent = dynamic(() => Promise.resolve(LoginPage), { ssr: false });

export default function LoginPageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    );
}