"use client"
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DefaultPFP from '../../img/DefaultPFP.svg';
import Select from 'react-select';

let APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const driverApproved = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
];

const statusOptions = [
    { value: 'Athlete', label: 'Athlete' },
    { value: 'Officer', label: 'Officer' }
];



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

interface TeamMember {
    Fname: string;
    Lname: string;
    GradYear: string;
    MemberType: string;
    Major: string;
    Phone: string;
    Email: string;
    CWID: string;
    PfpImage: string;
}

export default function EditProfile() {
    const [email, setEmail] = useState('');
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [selectedMajor, setSelectedMajor] = useState<{ value: string, label: string } | null>(null);
    const [slalomDriver, setslalomDriver] = useState('');
    const [trickDriver, settrickDriver] = useState('');
    const [jumpDriver, setjumpDriver] = useState('');
    const [phone, setPhone] = useState('');
    const [gradYear, setGradYear] = useState('');
    const [status, setStatus] = useState<{ value: string, label: string } | null>(null);

    const [PfpImage, setProfilePicture] = useState<File | null>(null);

    const [teamMember, setTeamMember] = useState<TeamMember | null>(null);

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

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authentication token missing. Please log in again.');
                return;
            }

            try {
                // const response = await axios.get<TeamMember>('http://localhost:4000/auth/profile', {
                //     headers: {
                //         Authorization: `Bearer ${token}`
                //     }
                // });

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
        
                    console.log("Current APP_URL:", APP_URL);
                } else {
                    console.log("oops you coded wrong, what a dummy");
                }
                const response = await axios.get<TeamMember>(`${APP_URL}api/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = response.data;
                setTeamMember(data);

            } catch (error) {
                console.error('Failed to fetch profile:', error);
            }
        };

        fetchProfile();
    }, []);

    const updateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authentication token missing. Please log in again.');
                return;
            }

            const payload = {
                Fname: fname,
                Lname: lname,
                GradYear: gradYear,
                Major: selectedMajor,
                Phone: phone,
                Email: email,
                Status: status,
                JumpDriver: jumpDriver,
                SlalomDriver: slalomDriver,
                TrickDriver: trickDriver
            };

            const response = await fetch('/api/updateProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ payload })
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Profile updated successfully!');
            } else {
                console.error('Failed to update profile:', data.error || 'Error occurred.');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    if (!teamMember) {
        return <div>No team member data available.</div>;
    }

    return (
        <div className="relative w-[417px] max-h-full h-[800px] bg-white rounded-[5px] z-40 overflow-y-auto flex flex-col items-center overflow-y-auto" style={{ top: '39px', right: '5px', borderLeft: '3px solid black' }}>
            <div className="relative w-full h-full">
                {/* red header section */}
                <div className="absolute left-0 top-0 w-full h-[280px] bg-[#9e1b32] z-10"></div>

                {/* user profile image */}
                <div className="absolute left-[50%] top-[5%] w-[230px] h-[230px] rounded-full z-20 transform -translate-x-[50%] overflow-hidden" style={{ top: '-2px' }}>
                    <Image
                        src={teamMember.PfpImage ? teamMember.PfpImage : DefaultPFP}
                        alt={`${teamMember.Fname} ${teamMember.Lname}'s profile image`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-full"
                    />
                </div>
            </div>
            <div>


                <div className="w-[433px] h-[866px] relative bg-white rounded-lg shadow-lg">


                    {/* Input Fields */}
                    <div className="absolute p-5" style={{ top: '290px' }}>
                        {/* First Name */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold">First Name</div>
                        <div className="w-[380px] h-[68px] bg-white rounded-[20px] border-2 border-[#9e1b32] mt-1">
                            <input
                                type="text"
                                value={fname}
                                onChange={(e) => setFname(e.target.value)}
                                className="w-full h-full text-black text-[15px] font-bold bg-transparent outline-none p-4"
                                placeholder={teamMember.Fname}
                            />
                        </div>

                        {/* Last Name */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold mt-5">Last Name</div>
                        <div className="w-[380px] h-[68px] bg-white rounded-[20px] border-2 border-[#9e1b32] mt-1">
                            <input
                                type="text"
                                value={lname}
                                onChange={(e) => setLname(e.target.value)}
                                className="w-full h-full text-black text-[15px] font-bold bg-transparent outline-none p-4"
                                placeholder={teamMember.Lname}
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold mt-5">Phone Number</div>
                        <div className="w-[380px] h-[68px] bg-white rounded-[20px] border-2 border-[#9e1b32] mt-1">
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full h-full text-black text-[15px] font-bold bg-transparent outline-none p-4"
                                placeholder={teamMember.Phone}
                            />
                        </div>


                        {/* Grad Year */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold mt-5">Grad Year</div>
                        <div className="w-[380px] h-[68px] bg-white rounded-[20px] border-2 border-[#9e1b32] mt-1">
                            <select

                                value={gradYear}
                                onChange={(e) => setGradYear(e.target.value)}
                                className="w-full h-full text-black text-[15px] font-bold bg-transparent outline-none p-4"

                            >
                                <option value="Freshman">Freshman</option>
                                <option value="Sophomore">Sophomore</option>
                                <option value="Junior">Junior</option>
                                <option value="Senior">Senior</option>
                            </select>
                        </div>








                        {/* Profile Photo */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold mt-5">Profile Photo</div>
                        <div className="w-[380px] h-[68px] bg-gray-200 rounded-[20px] border-2 border-[#9e1b32] mt-1 flex items-center">
                            <label className="w-full h-full text-black text-[15px] font-bold  outline-none p-28 flex items-center">
                                <span className="text-gray-700">Click to Upload</span>
                                <input
                                    type="file"
                                    accept=".png, .jpg, .jpeg, .webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            {PfpImage && <span className="ml-2 text-gray-600">{PfpImage.name}</span>}
                        </div>

                        {/* Major */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold mt-5">Major</div>

                        <Select
                            placeholder="Select your Major"
                            value={selectedMajor}
                            onChange={setSelectedMajor}
                            options={majors}
                            className="w-full"
                            required
                        />

                        {/* First Name */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold">Status</div>
                        <Select
                            placeholder="Select your Major"
                            value={status}
                            onChange={setStatus}
                            options={statusOptions}
                            className="w-full"
                            required
                        />

                        {/* Slalom Driver */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold">Slalom Driver</div>
                        <Select
                         placeholder="Approved?"
                            value={driverApproved.find(option => option.value === slalomDriver)} // Find option by value
                    
                            onChange={(option) => {
                                // Check if the option is not null or undefined
                                if (option?.value) {
                                  setslalomDriver(option.value); // Store only the value
                                }
                              }}
                            options={driverApproved}
                            className="w-full"
                            required
                        />


                        {/* Trick Driver */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold">Trick Driver</div>
                        <Select
                            placeholder="Approved?"
                            value={driverApproved.find(option => option.value === trickDriver)} // Find option by value
                            onChange={(option) => {
                                // Check if the option is not null or undefined
                                if (option?.value) {
                                  settrickDriver(option.value); // Store only the value
                                }
                              }}
                            options={driverApproved}
                            className="w-full"
                            required
                        />

                        {/* Jump Driver */}
                        <div className="text-[#b9b9b9] text-[15px] font-bold">Jump Driver</div>
                        <Select
                         placeholder="Approved?"
                            value={driverApproved.find(option => option.value === jumpDriver)} // Find option by value
                            onChange={(option) => {
                                // Check if the option is not null or undefined
                                if (option?.value) {
                                  setjumpDriver(option.value); // Store only the value
                                }
                              }}
                            options={driverApproved}
                            className="w-full"
                            required
                        />



                    </div>

                    {/* Save Button */}



                    <div onClick={updateProfile} className="w-[380px] h-[57px] bg-[#9e1b32] rounded-[30px] absolute left-[18px] bottom-[-400px]">
                        <button className="w-full h-full text-[#f7f7f7] text-xl font-bold font-['Inter']">Save</button>
                    </div>

                </div>
                <br>
                </br>
                <br>
                </br>
                <br>
                </br>
                <br>
                </br>
                <br>
                </br>
                <br>
                </br>
                <br>
                </br>
                <br>
                </br>
            </div>
        </div >

    );
}