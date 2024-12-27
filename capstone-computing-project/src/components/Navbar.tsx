// v6
"use client";

import Link from 'next/link';
import Image from 'next/image';
import HeaderWLAM from './img/headerWLAM.svg';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode"; // needed this for token expiration!!
import ProtectedProfilePage from '../app/protected-pages/protected-profile-page/page';
import EditPage from '../app/protected-pages/protected-profile-edit-page/page';
import defaultPfpImage from '../app/img/blankpfp.svg';
import axios from 'axios';
import CloseButton from './img/Vector (1).svg'
import EditIcon from '../app/img/EditPFPIcon.svg'

let APP_URL = process.env.NEXT_PUBLIC_APP_URL;


interface TeamMember {
    PfpImage: string;
    MemberType: string;
}

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false); // for mobile menu toggle
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // for about's dropdown toggle
    const [isLoggedIn, setIsLoggedIn] = useState(false); // track login status
    const [profilePic, setProfilePic] = useState<string>(defaultPfpImage); // default pfp image
    const [isProfileFetched, setIsProfileFetched] = useState<boolean>(false); // track if profile image has been fetched
    const [memberType, setMemberType] = useState<string>(''); // track user's member type
    const router = useRouter();
    const [isEditPageOpen, setIsEditPageOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleEditPage = () => {
        setIsEditPageOpen(!isEditPageOpen);
        setIsSidebarOpen(!isSidebarOpen);
        fetchProfile();
       

    };

    const handleClick = () => {

        toggleEditPage();
        setIsSidebarOpen(!isSidebarOpen);
       
    }
    // fetch the profile data including PfpImage and MemberType
    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            // console.log("did we arrive?");


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
            const response = await axios.get<TeamMember>(`${APP_URL}api/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setProfilePic(response.data.PfpImage || defaultPfpImage); // use profile image or default if not available
            setMemberType(response.data.MemberType); // store member type (Officer or Athlete)
            setIsProfileFetched(true); // mark profile as fetched
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
            setProfilePic(defaultPfpImage); // fallback to default image
            setIsProfileFetched(true); // mark profile as fetched even in case of error
        }
    };

    interface DecodedToken {
        exp?: number;
    }

    const checkTokenExpiration = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                const currentTime = Date.now() / 1000;

                // Check if 'exp' exists and is valid
                if (decoded.exp && decoded.exp < currentTime) {
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                    router.push('/login-page');
                } else if (decoded.exp) { // Only set logged in if 'exp' is defined and token is valid
                    setIsLoggedIn(true);
                    fetchProfile(); // fetch the profile image if token is valid
                }
            } catch (error) {
                localStorage.removeItem('token');
                setIsLoggedIn(false);
            }
        } else {
            setIsLoggedIn(false);
            setProfilePic(defaultPfpImage);
            setIsProfileFetched(false);
        }
    };


    useEffect(() => {
        checkTokenExpiration(); // checks token expiration when component mounts

        const checkToken = () => {
            const token = localStorage.getItem('token');
            setIsLoggedIn(!!token);
        };

        checkToken(); // the initial check when component mounts

        const intervalId = setInterval(checkToken, 1000); // check token every second

        return () => clearInterval(intervalId); // cleans up the interval on component unmount
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setProfilePic(defaultPfpImage); // reset profile image to default bc user logged out
        setIsProfileFetched(false); // reset profile fetched state
        setMemberType(''); // reset member type
        router.push('/'); // redirects to login page after logout
        // console.log('Logged out and redirected to home page');
        toggleMenu()
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // state to manage sidebar visibility

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // fetches profile every time `isLoggedIn` changes
    useEffect(() => {
        if (isLoggedIn) {
            fetchProfile();
        } else {
            setProfilePic(defaultPfpImage);
            setIsProfileFetched(false); // reset profile fetched state on logout
            setMemberType(''); // reset member type on logout
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden'; // disables background scroll when sidebar is open
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isSidebarOpen]);


    return (
        <nav className="bg-[#9E1B32] shadow-md sticky top-0 z-[9999] w-full relative">
            <div className="container mx-auto flex justify-between items-center pr-4 px-4 h-20 md:h-14 lg:h-15 relative">
                {/* where legends are made logo */}
                <Link href="/">
                    <div className="relative" style={{ height: '100%', width: '250px' }}>
                        <Image
                            src={HeaderWLAM}
                            alt="Header WLAM image"
                            className="cursor-pointer"
                            priority={true}

                        />
                    </div>
                </Link>

                {/* dropdown for mobile view */}
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-white focus:outline-none">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {isOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16m-7 6h7"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* navigation links for desktop */}
                <div className="hidden md:flex space-x-6 items-center">
                    <Link href="/" className="text-white text-base hover:text-black hover:underline transition duration-300">
                        Home
                    </Link>
                    {/* changing Team News and Team Records to be just News and Achievements for Navbar space */}
                    <Link href="/team-news-page" className="text-white text-base hover:text-black hover:underline transition duration-300">
                        News
                    </Link>
                    <Link href="/team-records-page" className="text-white text-base hover:text-black hover:underline transition duration-300">
                        Achievements
                    </Link>
                    {isLoggedIn && (
                        <Link href="/set-list-page" className="text-white text-base hover:text-black hover:underline transition duration-300">
                            Set List
                        </Link>
                    )}

                    {/* about dropdown */}
                    <div className="cursor-pointer items-center gap-1 group relative">
                        <div className="flex flex-row text-white text-base hover:text-black hover:underline transition duration-300">
                            <Link href="#" className="flex items-center py-2 px-4">
                                About
                                <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                                </svg>
                            </Link>
                        </div>
                        <ul className="z-50 left-1/2 transform -translate-x-1/2 hidden absolute pt-4 w-40 rounded-lg group-hover:block border-bg-black text-center">
                            {isLoggedIn ? (
                                <>
                                    <li className="border-2 hover:bg-[#9E1B32] hover:text-white text-black bg-white">
                                        <Link href="/roster-page" className="block py-2 px-4">
                                            Roster
                                        </Link>
                                    </li>
                                    <li className="border-2 hover:bg-[#9E1B32] hover:text-white text-black bg-white">
                                        <Link href="/club-information-page" className="block py-2 px-4">
                                            Club Info
                                        </Link>
                                    </li>
                                    <li className="border-2 hover:bg-[#9E1B32] hover:text-white text-black bg-white">
                                        <Link href="/merch-page" className="block py-2 px-4">
                                            Merch
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="border-2 hover:bg-[#9E1B32] hover:text-white text-black bg-white">
                                        <Link href="/club-information-page" className="block py-2 px-4">
                                            Club Info
                                        </Link>
                                    </li>
                                    <li className="border-2 hover:bg-[#9E1B32] hover:text-white text-black bg-white">
                                        <Link href="/merch-page" className="block py-2 px-4">
                                            Merch
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                     {isLoggedIn && memberType === 'Officer' && ( // only show Officer Resources if user is an officer
                        <Link href="/officer-resources-page" className="text-white text-base hover:text-black hover:underline transition duration-300">
                            Officer Resources
                        </Link>
                    )}
                </div>

                  {/* login/logout button */}
                  <div className="hidden md:flex items-center space-x-2 -mr-20">
                    <Link href="/contact-us-page" className="bg-white-500 text-white text-base py-2 px-2 rounded hover:underline hover:text-black">
                        Contact Us
                    </Link>

                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="bg-white-500 text-white text-base py-2 px-2 rounded hover:bg-white hover:text-[#9E1B32] transition duration-300">
                            Log Out
                        </button>
                    ) : (
                        <Link href="/login-page" className="bg-white-500 text-white text-base py-2 px-2 rounded hover:bg-white hover:text-[#9E1B32] transition duration-300">
                            Login
                        </Link>
                    )}

                  {/* Reserve space for profile picture, even if it's not visible */}
                  <div className="relative w-12 h-12">
                        {isLoggedIn && isProfileFetched ? (
                            <button onClick={toggleSidebar} className="p-0 m-0">
                                <Link href="#">
                                    <Image
                                        src={profilePic}
                                        alt="Profile picture"
                                        width={50}
                                        height={50}
                                        className="object-cover h-12 w-12 rounded-full"
                                    />
                                </Link>
                            </button>
                        ) : (
                            // Placeholder to maintain the layout
                            <div className="w-15 h-15"></div>
                        )}
                    </div>
                </div>



                {/* sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed right-0 h-full bg-[#9E1B32] z-[9998] overflow-y-auto"
                        style={{ top: '56px', width: '28%', borderTop: '3px solid maroon' }}
                    >
                        <div className="relative">
                            <button onClick={toggleSidebar} className="p-2 text-black">
                                <Image
                                    src={CloseButton}
                                    alt="Close"
                                    width={12}
                                    height={12}
                                    className="object-cover"
                                />
                            </button>

                            <button
                                onClick={toggleEditPage}
                                className="absolute top-0 right-1 p-2 z-50"
                            >
                                <Link href="#">
                                    <Image
                                        src={EditIcon}
                                        alt="Edit"
                                        width={20}
                                        height={20}
                                        className="object-cover"
                                    />
                                </Link>
                            </button>
                        </div>


                        {/* render the profile page content */}
                        <ProtectedProfilePage />
                    </div>
                )}



                <div>



                    {/* sidebar */}
                    {isEditPageOpen && (
                        <div
                        className="fixed right-0 h-full bg-[#9E1B32]  z-[9998] overflow-y-auto"
                        style={{ top: '56px', width: '28%', borderTop: '3px solid maroon' }}
                    >
                        <div className="relative">
                            <button onClick={handleClick} className="p-2 text-black">
                                <Image
                                    src={CloseButton}
                                    alt="Close"
                                    width={12}
                                    height={12}
                                    className="object-cover"
                                />
                            </button>

                            
                        </div>

                            {/* render the profile page content */}
                            <EditPage />
                        </div>

                    )}
                </div>


                {/* background overlay when sidebar is open */}
                {isSidebarOpen && <div className="fixed inset-0 bg-black opacity-40 z-40" style={{ top: '56px', width: '72.5%' }} onClick={toggleSidebar} />}
            </div>

            {isEditPageOpen && <div className="fixed inset-0 bg-black opacity-40 z-40" style={{ top: '56px', width: '72.5%' }} onClick={toggleSidebar} />}
         

            {/* mobile menu */}
            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} mt-4 space-y-4`}>
                <Link href="/" className="block text-white text-lg hover:text-black transition duration-300" onClick={closeMenu}>
                    Home
                </Link>
                {isLoggedIn && (
                    <Link href="/set-list-page" className="block text-white text-lg hover:text-black transition duration-300" onClick={closeMenu}>
                        Set List
                    </Link>
                )}

                {/* about dropdown for mobile */}
                <div>
                    <button onClick={toggleDropdown} className="flex justify-between items-center w-full text-white text-lg hover:text-black transition duration-300">
                        About
                        <svg className="w-2.5 h-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                        </svg>
                    </button>
                    {isDropdownOpen && (
                        <ul className="space-y-2 mt-2 bg-[#D67D7D]">
                            {isLoggedIn ? (
                                <>
                                    <li>
                                        <Link href="/roster-page" className="block text-white text-lg hover:text-black transition duration-300" onClick={closeMenu}>
                                            Roster
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/club-information-page" className="block text-white text-lg hover:text-black transition duration-300" onClick={closeMenu}>
                                            Club Info
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/merch-page" className="block text-white text-lg hover:text-black transition duration-300" onClick={closeMenu}>
                                            Merch
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link href="/club-information-page" className="block text-white text-lg hover:text-black transition duration-300" onClick={closeMenu}>
                                            Club Info
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/merch-page" className="block text-white text-lg hover:text-black transition duration-300" onClick={closeMenu}>
                                            Merch
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    )}
                </div>

                {isLoggedIn && memberType === 'Officer' && ( // only show Officer Resources for officers in mobile view
                    <Link href="/officer-resources-page" className="block text-white text-lg hover:text-black transition duration-300" onClick={closeMenu}>
                        Officer Resources
                    </Link>
                )}

                <Link href="/contact-us-page" onClick={toggleMenu} className="block text-white text-lg hover:text-black transition duration-300">
                    Contact Us
                </Link>
                <div>
                    {isLoggedIn && isProfileFetched ? (
                        <button onClick={toggleMenu} className="block text-white text-lg hover:text-black transition duration-300">
                            <Link href="/protected-pages/protected-profile-page">
                                <div className="flex flex-row items-center space-x-10">
                                    My Profile
                                    <br></br>
                                    <Image
                                        src={profilePic}
                                        alt="Profile picture"
                                        width={50}
                                        height={50}
                                        className="h-12 w-12 rounded-full border-2 border-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                                    />

                                </div>
                            </Link>
                        </button>
                    ) : (
                        <div></div>
                    )}
                </div>

                <div className="md:block">
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="block text-white text-lg hover:text-black transition duration-300">
                            Log Out
                        </button>
                    ) : (
                        <Link onClick={toggleMenu} href="/login-page" className="block text-white text-lg hover:text-black transition duration-300">
                            Login
                        </Link>
                    )}
                </div>

            </div>
        </nav>
    );
}