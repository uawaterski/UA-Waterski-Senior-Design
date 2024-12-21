// v3
// Current issues with manage members section for Roster page: 
// When a user has a PFP, and the admin edits information of the user, the PFP is deleted after admin presses save chagnes

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import BlankPfp from "../img/blankpfp.svg";
import React from "react";
import Select, { SingleValue, MultiValue } from "react-select";
import { useRouter } from "next/navigation";
import ScrollToTop from "../../components/ScrollToTop";
import editpfpicon from '../img/EditPFPIcon.svg';


let APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const yearOptions = [
    { value: "Freshman", label: "Freshman" },
    { value: "Sophomore", label: "Sophomore" },
    { value: "Junior", label: "Junior" },
    { value: "Senior", label: "Senior" },
];

const roleOptions = [
    { value: "Athlete", label: "Athlete" },
    { value: "Officer", label: "Officer" },
];

const sortOptions = [
    { value: "firstName", label: "Sort by First Name" },
    { value: "lastName", label: "Sort by Last Name" },
];

interface TeamMember {
    CWID: string;
    Fname: string;
    Lname: string;
    GradYear: string;
    MemberType: string;
    Major: string;
    PfpImage: string | null;
    Email?: string;
    Phone?: string;
    SlalomDriver?: string;
    TrickDriver?: string;
    JumpDriver?: string;
    isAdminVerified?: number;
}

interface Option {
    value: string;
    label: string;
}

export default function RosterPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedYears, setSelectedYears] = useState<MultiValue<Option>>([]);
    const [selectedRoles, setSelectedRoles] = useState<MultiValue<Option>>([]);
    const [selectedSortOption, setSelectedSortOption] = useState<SingleValue<Option>>(null);
    const [flipped, setFlipped] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false); // delete modal
    const [showEditModal, setShowEditModal] = useState(false); // edit user modal



    const [email, setEmail] = useState('');
    const [fname, setFname] = useState('');
    const [lname, setLname] = useState('');
    const [selectedMajor, setSelectedMajor] = useState('');
    const [slalomDriver, setslalomDriver] = useState('');
    const [trickDriver, settrickDriver] = useState('');
    const [jumpDriver, setjumpDriver] = useState('');
    const [phone, setPhone] = useState('');
    const [gradYear, setGradYear] = useState('');
    const [memberType, setStatus] = useState('');
    const [isUserUpdated, setIsUserUpdated] = useState(false);
    const [PfpImage, setProfilePicture] = useState<File | null>(null);


    const router = useRouter();

    useEffect(() => {
        document.title = "UA Waterski - Roster";
    }, []);

    const [isCheckingLogin, setIsCheckingLogin] = useState(true);

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setIsLoggedIn(false);
                router.push("/login-page");
            } else {
                const decodedToken = JSON.parse(atob(token.split(".")[1]));
                setIsLoggedIn(true);
                if (decodedToken.email === "skibama18@gmail.com") {
                    setIsSuperAdmin(true);
                }
            }
            setIsCheckingLogin(false);
        };

        checkToken();
    }, [router]);

    useEffect(() => {
        const fetchRoster = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No token available");
                }

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


                const response = await axios.get<TeamMember[]>(`${APP_URL}api/roster`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // admin account hidden on roster display
                // const filteredMembers = response.data.filter(
                //     (member) => member.Email?.toLowerCase() !== "skibama18@gmail.com"
                // );

                console.log("Fetched team members:", response.data);

                const filteredMembers = response.data.filter((member) => {
                    console.log("Member:", member);
                    console.log("isAdminVerified:", member.isAdminVerified);
                    return member.Email?.toLowerCase() !== "skibama18@gmail.com" && member.isAdminVerified === 1;
                });

                console.log("Filtered team members:", filteredMembers);

                setTeamMembers(filteredMembers);
            } catch (error) {
                console.error("Failed to fetch team roster:", error);
                router.push("/login-page");
            } finally {
                setLoading(false);
            }
        };

        if (isLoggedIn) {
            fetchRoster();
        }
    }, [isLoggedIn, router]);


    const handleYearChange = (selectedOptions: MultiValue<Option>) => {
        setSelectedYears(selectedOptions);
    };

    const handleRoleChange = (selectedOptions: MultiValue<Option>) => {
        setSelectedRoles(selectedOptions);
    };

    const handleToggleEdit = () => {
        setIsEditMode(!isEditMode);
    };

    const handleFlip = (index: number) => {
        setFlipped((prevFlipped) => (prevFlipped === index ? null : index));
    };

    const handleMouseLeave = (index: number) => {
        if (flipped === index) {
            setFlipped(null);
        }
    };

    const handleDeleteMember = async () => {
        if (!memberToDelete) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token available");
            }

            console.log("Deleting member with CWID: ", memberToDelete.CWID);
            console.log(
                "DELETE Endpoint:",
                `${APP_URL}api/roster?CWID=${memberToDelete.CWID}`
            );

            const response = await axios.delete(`${APP_URL}api/roster?CWID=${memberToDelete.CWID}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // console.log("Delete Response:", response);

            setTeamMembers((prevMembers) =>
                prevMembers.filter((member) => member.CWID !== memberToDelete.CWID)
            );

            setShowModal(false);
            setMemberToDelete(null);
        } catch (error) {
            console.error("Failed to delete team member:", error);
        }
    };




    const openDeleteModal = (member: TeamMember) => {
        setMemberToDelete(member);
        setShowDeleteModal(true);

    };

    const closeModal = () => {
        setShowDeleteModal(false);
        setMemberToDelete(null);
    };

    const openEditUserModal = (member: TeamMember) => {
        console.log("Edit Member:", member);
        setMemberToDelete(null);
        setShowEditModal(true);
        setMemberToDelete(member);
        setProfilePicture(null); 
        if (member.PfpImage) {
            setProfilePicture(new File([], member.PfpImage)); 
        }
    };

    const closeEditUserModal = () => {
        setShowEditModal(false);
        setMemberToDelete(null);
    };

    const handleEditMember = async (e: React.FormEvent) => {
        e.preventDefault(); // prevents form submission reload

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Authentication token missing. Please log in again.');
                return;
            }

            let pfpBase64 = null;
            if (PfpImage) {
                const reader = new FileReader();
                pfpBase64 = await new Promise((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result?.toString().split(",")[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(PfpImage);
                });
            }

            if (!memberToDelete) {
                console.error("No member selected for editing.");
                return;
            }

            const payload = {
                Fname: memberToDelete.Fname,
                Lname: memberToDelete.Lname,
                GradYear: memberToDelete.GradYear,
                Major: memberToDelete.Major,
                Phone: memberToDelete.Phone,
                MemberType: memberToDelete.MemberType,
                JumpDriver: memberToDelete.JumpDriver,
                SlalomDriver: memberToDelete.SlalomDriver,
                TrickDriver: memberToDelete.TrickDriver,
                PfpImage: pfpBase64,
                targetEmail: memberToDelete.Email,
            };

            const response = await fetch(`${APP_URL}api/updateProfile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ payload }),
            });

            if (response.ok) {
                const updatedMember = await response.json();

                // updates the teamMembers state directly
                setTeamMembers((prevMembers) =>
                    prevMembers.map((member) =>
                        member.CWID === updatedMember.CWID ? { ...member, ...updatedMember } : member
                    )
                );

                const fetchRoster = async () => {
                    try {
                        const token = localStorage.getItem("token");
                        if (!token) {
                            throw new Error("No token available");
                        }

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


                        const response = await axios.get<TeamMember[]>(`${APP_URL}api/roster`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        });

                        // admin account hidden on roster display
                        // todo: using .env to hide the admin email for better security
                        // const filteredMembers = response.data.filter(
                        //     (member) => member.Email?.toLowerCase() !== "skibama18@gmail.com"
                        // );

                        const filteredMembers = response.data.filter((member) => {
                            console.log("Member:", member);
                            console.log("isAdminVerified:", member.isAdminVerified);
                            return member.Email?.toLowerCase() !== "skibama18@gmail.com" && member.isAdminVerified === 1;
                        });

                        setTeamMembers(filteredMembers);
                    } catch (error) {
                        console.error("Failed to fetch team roster:", error);
                        router.push("/login-page");
                    } finally {
                        setLoading(false);
                    }
                };

                await fetchRoster();

                // close the modal
                setIsUserUpdated(!isUserUpdated);
                closeEditUserModal();
            } else {
                const error = await response.json();
                console.error('Failed to update member profile:', error.message || response.statusText);
            }
        } catch (error) {
            console.error('Failed to update member profile:', error);
        }
    };


    const filteredMembers = teamMembers
        .filter((member) => {
            const fullName = `${member.Fname} ${member.Lname}`.toLowerCase();
            const major = member.Major?.toLowerCase() || "";
            const gradYear = member.GradYear?.toLowerCase() || "";
            const memberType = member.MemberType?.toLowerCase() || "";

            const matchesYear = selectedYears.length > 0
                ? selectedYears.some((option) => option.value.toLowerCase() === gradYear)
                : true;

            const matchesRole = selectedRoles.length > 0
                ? selectedRoles.some((option) => option.value.toLowerCase() === memberType)
                : true;

            const matchesSearchQuery =
                fullName.includes(searchQuery.toLowerCase()) ||
                major.includes(searchQuery.toLowerCase());

            return matchesYear && matchesRole && matchesSearchQuery;
        })
        .sort((a, b) => {
            if (selectedSortOption?.value === "firstName") {
                return a.Fname.localeCompare(b.Fname);
            } else if (selectedSortOption?.value === "lastName") {
                return a.Lname.localeCompare(b.Lname);
            }
            return 0;
        });

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-[#9E1B32]">Team Roster</h1>

                {/* Edit Button for Admin */}
                {isSuperAdmin && (
                    <button
                        onClick={handleToggleEdit}
                        className="bg-[#9E1B32] text-white px-4 py-2 rounded-md shadow-md hover:bg-[#B32346] transition duration-300"
                    >
                        {isEditMode ? "Cancel" : "Edit"}
                    </button>
                )}
            </div>

            {/* Search bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search for Team Members..."
                    className="w-full p-2 border border-gray-300 rounded-md text-black"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Select
                    isMulti
                    options={yearOptions}
                    value={selectedYears}
                    onChange={handleYearChange}
                    className="text-black"
                    placeholder="Filter by Class Year"
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: "#9E1B32",

                        },
                    })}
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            borderRadius: "8px",
                            borderColor: "#9E1B32",
                            boxShadow: "none",
                            "&:hover": {
                                borderColor: "#9E1B32",
                            },
                        }),
                        menu: (provided) => ({
                            ...provided,
                            borderRadius: "8px",
                            border: "1px solid #9E1B32",
                            boxShadow: "none",
                        }),
                        option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                                ? "#ffffff"
                                : state.isFocused
                                    ? "#FBE4E6"
                                    : "white",
                            color: state.isSelected ? "#9E1B32" : "#333333",
                            "&:hover": {
                                backgroundColor: "#FBE4E6",
                            },
                        }),
                    }}
                />
                <Select
                    isMulti
                    options={roleOptions}
                    value={selectedRoles}
                    onChange={handleRoleChange}
                    className="text-black"
                    placeholder="Filter by Member Type"
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: "#9E1B32",

                        },
                    })}
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            borderRadius: "8px",
                            borderColor: "#9E1B32",
                            boxShadow: "none",
                            "&:hover": {
                                borderColor: "#9E1B32",
                            },
                        }),
                        menu: (provided) => ({
                            ...provided,
                            borderRadius: "8px",
                            border: "1px solid #9E1B32",
                            boxShadow: "none",
                        }),
                        option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                                ? "#ffffff"
                                : state.isFocused
                                    ? "#FBE4E6"
                                    : "white",
                            color: state.isSelected ? "#9E1B32" : "#333333",
                            "&:hover": {
                                backgroundColor: "#FBE4E6",
                            },
                        }),
                    }}
                />
                <Select
                    options={sortOptions}
                    value={selectedSortOption}
                    onChange={(option) => setSelectedSortOption(option)}
                    className="text-black"
                    placeholder="Sort by Name"
                    isClearable
                    theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary: "#9E1B32",

                        },
                    })}
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            borderRadius: "8px",
                            borderColor: "#9E1B32",
                            boxShadow: "none",
                            "&:hover": {
                                borderColor: "#9E1B32",
                            },
                        }),
                        menu: (provided) => ({
                            ...provided,
                            borderRadius: "8px",
                            border: "1px solid #9E1B32",
                            boxShadow: "none",
                        }),
                        option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                                ? "#ffffff"
                                : state.isFocused
                                    ? "#FBE4E6"
                                    : "white",
                            color: state.isSelected ? "#9E1B32" : "#333333",
                            "&:hover": {
                                backgroundColor: "#FBE4E6",
                            },
                        }),
                    }}
                />
            </div>

            {loading ? (
                <p className="text-gray-500 text-center">Loading roster...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {filteredMembers && filteredMembers.length > 0 ? (
                        filteredMembers.map((member, index) => (
                            <div
                                key={member.CWID}
                                className={`relative perspective w-full h-72 border border-gray-200 transform hover:scale-105`}
                                onClick={() => handleFlip(index)}
                                onMouseLeave={() => handleMouseLeave(index)}
                            >
                                <div className={`flip-card ${flipped === index ? "flipped" : ""}`}>
                                    <div className="flip-card-front bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden h-full">
                                        <div className="p-4">
                                            <div className="relative w-24 h-24 mb-4 mx-auto">
                                                <Image
                                                    src={member.PfpImage || BlankPfp}
                                                    alt={`${member.Fname} ${member.Lname}'s profile image`}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="rounded-full border shadow"
                                                />
                                            </div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-1 text-center">
                                                {member.Fname} {member.Lname}
                                            </h2>
                                            <p className="text-gray-700">
                                                <strong>Status:</strong> {member.MemberType}
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Graduation Year:</strong> {member.GradYear}
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Major:</strong> {member.Major || "N/A"}
                                            </p>
                                        </div>

                                        {/* admin account pressed edit button on roster page. */}
                                        {isEditMode && (
                                            <div className="relative flex justify-end space-x-4 mr-2">
                                                {/* delete button icon */}
                                                <button
                                                    onClick={() => openDeleteModal(member)}
                                                    className="bg-gray-200 text-red-500 px-2 py-1 w-10 h-10 -mt-60 rounded-md shadow-md hover:bg-gray-500 transition duration-300"
                                                >
                                                    -
                                                </button>

                                                {/* edit button icon */}
                                                <button
                                                    onClick={() => openEditUserModal(member)}
                                                    className="bg-gray-200 text-white px-4 py-1 w-10 h-10 -mt-60 rounded-md shadow-md hover:bg-gray-500 transition duration-300"
                                                >
                                                    <Image src={editpfpicon} alt="Edit PFP Icon" />
                                                </button>
                                            </div>
                                        )}

                                    </div>

                                    <div className="flip-card-back bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden p-4 text-black h-full">
                                        <h2 className="text-xl font-semibold text-center mb-1">
                                            {member.Fname} {member.Lname}
                                        </h2>
                                        <p>
                                            <strong>Email:</strong> {member.Email || "N/A"}
                                        </p>
                                        <p>
                                            <strong>Phone:</strong> {member.Phone || "N/A"}
                                        </p>
                                        <p>
                                            <strong>Slalom Driver:</strong> {member.SlalomDriver}
                                        </p>
                                        <p>
                                            <strong>Trick Driver:</strong> {member.TrickDriver}
                                        </p>
                                        <p>
                                            <strong>Jump Driver:</strong> {member.JumpDriver}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-black-500 text-center">No team members found.</p>
                    )}
                </div>
            )}

            <ScrollToTop />

            {/* Confirmation Modal */}
            {showDeleteModal && memberToDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 text-center">
                        <h3 className="text-2xl font-semibold mb-4 text-[#9E1B32]">
                            Confirm Deletion
                        </h3>
                        <p className="text-gray-700">
                            Are you sure you want to delete {memberToDelete.Fname} {memberToDelete.Lname} from the roster?
                        </p>
                        <div className="flex justify-center mt-6 space-x-4">
                            <button
                                onClick={closeModal}
                                className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteMember}
                                className="bg-[#9E1B32] text-white px-4 py-2 rounded-md hover:bg-[#8B1A2B]"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for editing user */}
            {showEditModal && memberToDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative mt-10" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                        <h3 className="text-2xl font-semibold mb-4 text-[#9E1B32]">
                            Edit Member Details
                        </h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault(); // prevents the default form submission
                                handleEditMember(e);
                            }}
                        >

                            {/* update user's First Name */}
                            <label className="block mb-2 text-black">
                                First Name
                                <input
                                    type="text"
                                    value={memberToDelete.Fname}
                                    onChange={(e) =>
                                        setMemberToDelete({
                                            ...memberToDelete,
                                            Fname: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded-md"
                                />
                            </label>

                            {/* update user's Last Name */}
                            <label className="block mb-2 text-black">
                                Last Name
                                <input
                                    type="text"
                                    value={memberToDelete.Lname}
                                    onChange={(e) =>
                                        setMemberToDelete({
                                            ...memberToDelete,
                                            Lname: e.target.value,
                                        })
                                    }
                                    className="w-full p-2 border rounded-md"
                                />
                            </label>

                            {/* update user's PFP or remove their pfp entirely if inappropriate */}

                            <label className="block mb-2 text-black">
                                Profile Picture
                                <div className="flex items-center space-x-4 bg-[#9E1B32]">
                                    {/* hides the original file input text (Choose File with gray background one) */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="profile-picture"
                                        onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />

                                    {/* custom button to upload */}
                                    <label
                                        htmlFor="profile-picture"
                                        className="bg-[#9E1B32] text-white px-4 py-2 rounded-md shadow-md hover:bg-[#B32346] cursor-pointer transition duration-300"
                                    >
                                        Choose File
                                    </label>

                                    {PfpImage && (
                                        <span className="text-white">{PfpImage.name.slice(0,20)}</span>
                                    )}
                                </div>
                            </label>


                            <div className="flex items-center mt-2">
                                {/* Custom Styled Checkbox */}
                                <input
                                    type="checkbox"
                                    id="remove-pfp"
                                    onChange={async (e) => {
                                        if (e.target.checked && setProfilePicture !== null) {
                                            setProfilePicture(null);
                                            setMemberToDelete({
                                                ...memberToDelete,
                                                PfpImage: null,
                                            });
                                        }
                                    }}
                                    className="peer hidden"
                                />
                                <label
                                    htmlFor="remove-pfp"
                                    className="w-5 h-5 border border-1 border-[#9E1B32] rounded-md flex items-center justify-center cursor-pointer peer-checked:bg-[#9E1B32] peer-checked:text-white"
                                >
                                    ✓
                                </label>
                                <span className="ml-2 text-gray-500">Remove Profile Picture</span>
                            </div>


                            {/* end of section for user's PFP or remove their pfp entirely if inappropriate */}

                            {/* update user's GradYear */}
                            <label className="block mb-2 text-black">
                                Graduation Year
                                <Select
                                    value={{
                                        value: memberToDelete.GradYear,
                                        label: memberToDelete.GradYear,
                                    }}
                                    options={yearOptions}
                                    onChange={(selectedOption) =>
                                        setMemberToDelete({
                                            ...memberToDelete,
                                            GradYear: selectedOption?.value || "",
                                        })
                                    }
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: "#9E1B32",

                                        },
                                    })}
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            borderColor: "#9E1B32",
                                            boxShadow: "none",
                                            "&:hover": {
                                                borderColor: "#9E1B32",
                                            },
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            border: "1px solid #9E1B32",
                                            boxShadow: "none",
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected
                                                ? "#ffffff"
                                                : state.isFocused
                                                    ? "#FBE4E6"
                                                    : "white",
                                            color: state.isSelected ? "#9E1B32" : "#333333",
                                            "&:hover": {
                                                backgroundColor: "#FBE4E6",
                                            },
                                        }),
                                    }}
                                />
                            </label>

                            {/* update user's member type (Athlete or Officer) */}
                            <label className="block mb-2 text-black">
                                Member Type
                                <Select
                                    value={{
                                        value: memberToDelete.MemberType,
                                        label: memberToDelete.MemberType,
                                    }}
                                    options={roleOptions}
                                    onChange={(selectedOption) =>
                                        setMemberToDelete({
                                            ...memberToDelete,
                                            MemberType: selectedOption?.value || "",
                                        })
                                    }
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: "#9E1B32",
                                        },
                                    })}
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            borderColor: "#9E1B32",
                                            boxShadow: "none",
                                            "&:hover": {
                                                borderColor: "#9E1B32",
                                            },
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            border: "1px solid #9E1B32",
                                            boxShadow: "none",
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected
                                                ? "#ffffff"
                                                : state.isFocused
                                                    ? "#FBE4E6"
                                                    : "white",
                                            color: state.isSelected ? "#9E1B32" : "#333333",
                                            "&:hover": {
                                                backgroundColor: "#FBE4E6",
                                            },
                                        }),
                                    }}
                                />
                            </label>

                            {/* update user on their SlalomDriver TrickDriver JumpDriver with yes or no choice */}
                            <label className="block mb-2 text-black">
                                Slalom Driver
                                <Select
                                    value={{
                                        value: memberToDelete.SlalomDriver,
                                        label: memberToDelete.SlalomDriver,
                                    }}
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ]}
                                    onChange={(selectedOption) =>
                                        setMemberToDelete({
                                            ...memberToDelete,
                                            SlalomDriver: selectedOption?.value || "",
                                        })
                                    }
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: "#9E1B32",
                                        },
                                    })}
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            borderColor: "#9E1B32",
                                            boxShadow: "none",
                                            "&:hover": {
                                                borderColor: "#9E1B32",
                                            },
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            border: "1px solid #9E1B32",
                                            boxShadow: "none",
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected
                                                ? "#ffffff"
                                                : state.isFocused
                                                    ? "#FBE4E6"
                                                    : "white",
                                            color: state.isSelected ? "#9E1B32" : "#333333",
                                            "&:hover": {
                                                backgroundColor: "#FBE4E6",
                                            },
                                        }),
                                    }}
                                />

                            </label>
                            <label className="block mb-2 text-black">
                                Trick Driver
                                <Select
                                    value={{
                                        value: memberToDelete.TrickDriver,
                                        label: memberToDelete.TrickDriver,
                                    }}
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ]}
                                    onChange={(selectedOption) =>
                                        setMemberToDelete({
                                            ...memberToDelete,
                                            TrickDriver: selectedOption?.value || "",
                                        })
                                    }
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: "#9E1B32",
                                        },
                                    })}
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            borderColor: "#9E1B32",
                                            boxShadow: "none",
                                            "&:hover": {
                                                borderColor: "#9E1B32",
                                            },
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            border: "1px solid #9E1B32",
                                            boxShadow: "none",
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected
                                                ? "#ffffff"
                                                : state.isFocused
                                                    ? "#FBE4E6"
                                                    : "white",
                                            color: state.isSelected ? "#9E1B32" : "#333333",
                                            "&:hover": {
                                                backgroundColor: "#FBE4E6",
                                            },
                                        }),
                                    }}
                                />
                            </label>
                            <label className="block mb-2 text-black">
                                Jump Driver
                                <Select
                                    value={{
                                        value: memberToDelete.JumpDriver,
                                        label: memberToDelete.JumpDriver,
                                    }}
                                    options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                    ]}
                                    onChange={(selectedOption) =>
                                        setMemberToDelete({
                                            ...memberToDelete,
                                            JumpDriver: selectedOption?.value || "",
                                        })
                                    }
                                    theme={(theme) => ({
                                        ...theme,
                                        colors: {
                                            ...theme.colors,
                                            primary: "#9E1B32",
                                        },
                                    })}
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            borderColor: "#9E1B32",
                                            boxShadow: "none",
                                            "&:hover": {
                                                borderColor: "#9E1B32",
                                            },
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            borderRadius: "8px",
                                            border: "1px solid #9E1B32",
                                            boxShadow: "none",
                                        }),
                                        option: (provided, state) => ({
                                            ...provided,
                                            backgroundColor: state.isSelected
                                                ? "#ffffff"
                                                : state.isFocused
                                                    ? "#FBE4E6"
                                                    : "white",
                                            color: state.isSelected ? "#9E1B32" : "#333333",
                                            "&:hover": {
                                                backgroundColor: "#FBE4E6",
                                            },
                                        }),
                                    }}
                                />
                            </label>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={closeEditUserModal}
                                    type="button"
                                    className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#9E1B32] text-white px-4 py-2 rounded-md hover:bg-[#8B1A2B]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

