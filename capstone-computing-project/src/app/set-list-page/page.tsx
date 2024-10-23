"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './setlist_styles.css'
import Image from 'next/image';
import BlankPfp from '../img/blankpfp.svg';
import { useRouter } from 'next/navigation';

interface SetListReservation {
    Date: string;
    Fname: string;
    Lname: string;
    Email: string;
    RegisteredBy: string;
}

interface TeamMember {
    Fname: string;
    Lname: string;
    GradYear: string;
    MemberType: string;
    Major: string;
    PfpImage: string;
    Email?: string;
    Phone?: string;
}

const Button = ({ onClick, className, children }) => {
    return (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    );
};

const makeReservation = async (date) => {
    try {

        const token = localStorage.getItem('token'); 
        if (!token) {
            throw new Error('No token found'); 
        }

        console.log("Token: " + token);

        const payload = {
            'reserveDate': date
        };

        const response = await axios.post('http://localhost:4000/auth/setlist', payload, {
            headers: {
                Authorization: `Bearer ${token}` // send the token in the request headers to authenticate
            },
        });

        console.log('Data Recieved for setList:', response.data);

    } catch (error) {
        console.error('Failed to make reservation', error);
        alert("An error occurred when trying to make a reservation. Please contact the site administrator.");
    } finally {

    }
};

const deleteReservation = async (date) => {
    try {

        const token = localStorage.getItem('token'); 
        if (!token) {
            throw new Error('No token found'); 
        }

        console.log("Token: " + token);

        const payload = {
            headers: {
                Authorization: `Bearer ${token}` // send the token in the request headers to authenticate
            },
            data: {
                'reserveDate': date
            }
        };

        const response = await axios.delete('http://localhost:4000/auth/setlist', payload);

        console.log('Data Recieved for setList:', response.data);

    } catch (error) {
        console.error('Failed to delete reservation', error);
        alert("An error occurred when trying to delete your reservation. Please contact the site administrator.");
    } finally {

    }
};

const ShowUserInfo = ({userInfo}) => {

};

const SetListButton = ({date, reservationState, reservationName}) => {
    const handleClick = () => {
        // In here, we need to get the CWID of the current user, or maybe we can handle that by passing the JWT token?
        // alert('Button clicked! Date: ' + date.toString());
        if (reservationState == "open" && date >= Date.now()) {
            alert("Attempting to make reservation...");
            makeReservation(date.getTime());
            // If registration fails, show alert stating that registration failed
            // Whether registration fails or succeeds, refresh page to show new data
            window.location.reload();
        } else if (reservationState == "reservedByYou" && date >= Date.now()) {
            alert("Attempting to cancel reservation...");
            deleteReservation(date.getTime());
            // If cancellation fails, show alert stating that cancellation failed
            // Whether registration fails or succeeds, refresh page to show new data
            window.location.reload();
        } else if (reservationState == "reservedBySomeoneElse") {
            alert("Attempting to show person's profile info...");
            // Show a model of some kind to display persons info. Look at how roster page shows info and use that
        }
    };
    
    if (date < Date.now()) { // If date is before current time, disallow registration
        if (reservationState == "reservedBySomeoneElse") {
            return (
                <div>
                  <Button className="reservedBySomeoneElse" onClick={handleClick}>Past reservation, reserved by {reservationName}</Button>
                </div>
            ); 
        } else if (reservationState == "reservedByYou") {
            return (
                <div>
                  <Button className="reservedBySomeoneElse" onClick={handleClick}>Past reservation, reserved by you</Button>
                </div>
            ); 
        } else {
            return (
                <div>
                  <Button className="pastReservation" onClick={handleClick}>Past reservation, cannot register</Button>
                </div>
            ); 
        }
    } else if (reservationState == "open") { // open slot
        return (
            <div>
              <Button className="openReservation" onClick={handleClick}>Slot available. Click to reserve</Button>
            </div>
        ); 
    } else if (reservationState == "reservedByYou") { // reserved by current user
        return (
            <div>
              <Button className="reservedByYou" onClick={handleClick}>Slot registered by you. Click to cancel</Button>
            </div>
        ); 
    } else { // reserved by someone else
        return (
            <div>
              <Button className="reservedBySomeoneElse" onClick={handleClick}>Reserved by {reservationName}</Button>
            </div>
        ); 
    }
};

export default function SetListPage() {
    const [reservations, setReservations] = useState<SetListReservation[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // initial state as null to represent loading
    const [loading, setLoading] = useState<boolean>(true);
    const [isCheckingLogin, setIsCheckingLogin] = useState(true); // Track if checking login status
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timesSet = new Set();
    const router = useRouter();

    // Check if the user is logged in by looking for the token in localStorage
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoggedIn(false);
                router.push('/login-page'); // Redirect to login page if not logged in
            } else {
                setIsLoggedIn(true); // Set logged-in status
            }
            setIsCheckingLogin(false); // Done checking login status
        };

        checkToken(); // Initial check when the component mounts
    }, [router]);
    
    // Getting the roster
    useEffect(() => {
        const fetchRoster = async () => {
            try {
                const token = localStorage.getItem('token'); // Get the token from localStorage
                if (!token) {
                    throw new Error('No token available');
                }

                const response = await axios.get<TeamMember[]>('http://localhost:4000/auth/roster', {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Send token in request headers
                    },
                });

                setTeamMembers(response.data); // Set the team members data
            } catch (error) {
                console.error('Failed to fetch team roster:', error);
                router.push('/login-page'); // Redirect to login if fetch fails
            } finally {
                setLoading(false);
            }
        };

        if (isLoggedIn) {
            fetchRoster(); // Only fetch the roster if the user is logged in
        }
    }, [isLoggedIn, router]);

    console.log(teamMembers);

    // Sets up the TimeTable
    function TimeTableBody() {
        var rows = [];

        var currentWeekDropDown = document.getElementById("dateRangeDropDown") as HTMLInputElement;

        // Drop down must be created before table can be returned, so return nothing until drop down exists on document
        if (currentWeekDropDown == null) {
            return;
        }

        var currentWeekStartDate = new Date(Number(currentWeekDropDown.value) * 1000);

        // From 7am to 5pm
        for (var hour = 7; hour <= 17; hour++) {
            // From :00 to :45
            for (var minutes = 0; minutes < 60; minutes += 15) {
                // Special case to allow for 5pm
                if (hour == 17 && minutes != 0) {
                    continue;
                }

                var cells = [];
                
                // Handle 12 hour logic
                var hourString = (hour <= 12) ? hour.toString() : (hour - 12).toString();
                // Add leading zero if hours is 0 (could also do this with precision?)
                var minuteString = (minutes == 0) ? minutes.toString() + "0" : minutes.toString();
                var amPMString = (hour < 12) ? "am" : "pm";
    
                var timeString = hourString + ":" + minuteString + amPMString;
                // Set id for right-align styling
                cells.push(<td key={"timeCell_" + hour + "_" + minutes}className="timeCell">{timeString}</td>);
                // Initialize empty table cells for later modification
                for (var day = 0; day <= 6; day++) {

                    var thisButtonDate = new Date(new Date(currentWeekStartDate).setDate(currentWeekStartDate.getDate() + (day)));
                    thisButtonDate.setHours(hour);
                    thisButtonDate.setMinutes(minutes);
                    thisButtonDate.setSeconds(0);
                    thisButtonDate.setMilliseconds(0);

                    // Here, we should change reservationState depending on results from database
                    if (timesSet.has(thisButtonDate.getTime())) {
                        // Find reservation
                        // This is potentially slow depending on the amount of reservations in the 5 week time span. Maybe try to optimize later
                        for (var i = 0; i < reservations.length; i++) {
                            if (new Date(reservations[i].Date).getTime() == thisButtonDate.getTime()) {
                                // console.log(reservations[i].RegisteredBy);
                                if (reservations[i].RegisteredBy == "you") {
                                    cells.push(<td key={day + "_" + hour + "_" + minutes}><SetListButton date={thisButtonDate} reservationState={"reservedByYou"} reservationName={reservations[i].Fname + " " + reservations[i].Lname}></SetListButton></td>);
                                } else {
                                    cells.push(<td key={day + "_" + hour + "_" + minutes}><SetListButton date={thisButtonDate} reservationState={"reservedBySomeoneElse"} reservationName={reservations[i].Fname + " " + reservations[i].Lname}></SetListButton></td>);
                                }
                                break;
                            }
                        }
                        // cells.push(<td key={day + "_" + hour + "_" + minutes}><SetListButton date={thisButtonDate} reservationState={"reservedBySomeoneElse"} reservationName={"blah"}></SetListButton></td>);
                    } else {
                        cells.push(<td key={day + "_" + hour + "_" + minutes}><SetListButton date={thisButtonDate} reservationState={"open"} reservationName={"blah"}></SetListButton></td>);
                    }
                }
                
                rows.push(<tr key={"row_" + hour + "_" + minutes}>{cells}</tr>);
            }
        }

        return (
            <tbody>
                {rows}
            </tbody>
        )

    }

    function TimeTable() {
        return (
            <table id="setListTable">
                <thead>
                    <tr>
                        <th className="timeCell">Time</th>
                        <th>Sunday</th>
                        <th>Monday</th>
                        <th>Tuesday</th>
                        <th>Wednesday</th>
                        <th>Thursday</th>
                        <th>Friday</th>
                        <th>Saturday</th>
                    </tr>
                </thead>
                {TimeTableBody()}
            </table>
        )
    }

    const TimeTableWithDropDown = ({values, labels}) => {
        if (values == null || labels == null) {
            return;
        }
        //console.log(values);
        var options = [];
        for (var i = 0; i < values.length; i++) {
            options.push([values[i], labels[i]]);
        }
        const [selectedOption, setSelectedOption] = useState(options[2][0]);
        return (
            <div id="timeTableDiv">
                <select
                    id="dateRangeDropDown"
                    value={selectedOption}
                    onChange={e => setSelectedOption(e.target.value)}>
                    {options.map(o => (
                    <option key={o[0]} value={o[0]}>{o[1]}</option>
                    ))}
                </select>
                {TimeTable()}
            </div>
        );
    };

    function TimeTableInit() {
        var today = new Date();
        // weekRange is the number of weeks shown before and after the current week.
        // Setting this to 2 will result in a list that containts the two weeks before the current week, the current week, and the next two weeks after the current week
        // Seems like setting it above 2 causes odd behavior. Not sure what the cause of this is.
        var weekRange = 2;

        var dateRanges = [];
        var values = [];
        var labels = [];

        var thisWeekSunday = new Date();
        thisWeekSunday.setDate(today.getDate() - today.getDay());
        //console.log(thisWeekSunday);

        for (var i = 0; i < (weekRange * 2) + 1; i++) {
            // Each item in dateRange is an array consisting of a start and end day for the week
            dateRanges.push([new Date(), new Date()]);
            dateRanges[i][0].setDate(today.getDate() - today.getDay() + (7 * (i - weekRange)));
            dateRanges[i][1].setDate(today.getDate() - today.getDay() + (7 * (i - weekRange)) + 6);
            labels.push(dateRanges[i][0].toLocaleDateString("en-US") + " - " + dateRanges[i][1].toLocaleDateString("en-US"));
            values.push(dateRanges[i][0].getTime() / 1000);
        }
        //console.log(values);
        //console.log(labels);

        // // Previous (weekRange) weeks
        // for (var i = 0; i < weekRange; i++) {
        //     optionsList.push(<option key={"prevWeek" + i} value={dateRanges[i][0].getTime() / 1000}>{dateRanges[i][0].toLocaleDateString("en-US") + " - " + dateRanges[i][1].toLocaleDateString("en-US")}</option>);
        // }

        // // Current week
        // optionsList.push(<option key="currentWeek" value={thisWeekSunday.getTime() / 1000}>{dateRanges[Math.floor(weekRange / 2) + 1][0].toLocaleDateString("en-US") + " - " + dateRanges[Math.floor(weekRange / 2) + 1][1].toLocaleDateString("en-US")}</option>);

        // // Next (weekRange) weeks
        // for (var i = 0; i < weekRange; i++) {
        //     optionsList.push(<option key={"nextWeek" + i} value={dateRanges[i + weekRange + 1][0].getTime() / 1000}>{dateRanges[i + weekRange + 1][0].toLocaleDateString("en-US") + " - " + dateRanges[i + weekRange + 1][1].toLocaleDateString("en-US")}</option>);
        // }

        return (
            <TimeTableWithDropDown values={values} labels={labels}></TimeTableWithDropDown>
        )
    }
    
    const todayDate = new Date();
    const dateRangeStart = new Date();
    dateRangeStart.setDate(todayDate.getDate() - todayDate.getDay() - 14);
    const dateRangeEnd = new Date();
    dateRangeEnd.setDate(todayDate.getDate() - todayDate.getDay() + 20);
    const dateRangeStartString = dateRangeStart.getFullYear().toString() + "-" + (dateRangeStart.getMonth() + 1).toString() + "-" + dateRangeStart.getDate().toString() + " 00:00:00";
    const dateRangeEndString = dateRangeEnd.getFullYear().toString() + "-" + (dateRangeEnd.getMonth() + 1).toString() + "-" + dateRangeEnd.getDate().toString() + " 23:59:59";
    // Get reservations on page load
    useEffect(() => {
        const fetchSetList = async () => {
            try {
                const token = localStorage.getItem('token'); 
                if (!token) {
                    throw new Error('No token found'); 
                }

                const response = await axios.get<SetListReservation[]>('http://localhost:4000/auth/setlist', {
                    headers: {
                        Authorization: `Bearer ${token}` // send the token in the request headers to authenticate
                    },
                    params: {
                        startDate: dateRangeStartString,
                        endDate: dateRangeEndString
                    }
                });

                console.log('Data Recieved for setList:', response.data); 

                setReservations(response.data); // store profile data in state
            } catch (error) {
                console.error('Failed to fetch Reservation', error);
                alert("An error occurred when trying to fetch the Set List. Please contact the site administrator.");
            } finally {
                setLoading(false);
            }
        };

        fetchSetList();
    }, []);

    if (loading) {
        return <div className="text-black">Loading...</div>; // Render a loading message while data is being fetched
    }

    const firstReservation = reservations.length > 0 ? reservations[0] : undefined;
    const secondReservation = reservations.length > 0 ? reservations[1] : undefined;

    for (var i = 0; i < reservations.length; i++) {
        console.log("Adding " + new Date(reservations[i].Date).getTime() + " to dates!");
        timesSet.add(new Date(reservations[i].Date).getTime());
    }

    // console.log(timesSet);
    
    return (
        <div className="relative bg-white rounded-[5px]">

            {TimeTableInit()}
            <div>
                <div className="flip-card-front bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden h-full">
                    <div className="p-4">
                        {/* Profile Picture */}
                        <div className="relative w-24 h-24 mb-4 mx-auto">
                            <Image
                                src={BlankPfp}
                                alt={`${"member.Fname"} ${"member.Lname"}'s profile image`}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-full border shadow"
                            />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1 text-center">
                            {"member.Fname"} {"member.Lname"}
                        </h2>
                        <p className="text-gray-700">
                            <strong>Member Type:</strong> {"member.MemberType"}
                        </p>
                        <p className="text-gray-700">
                            <strong>Graduation Year:</strong> {"member.GradYear"}
                        </p>
                        <p className="text-gray-700">
                            <strong>Major:</strong> {"member.Major" || 'N/A'}
                        </p>
                        <p className="text-gray-700">
                            <strong>Email:</strong> {"member.Email" || 'N/A'}
                        </p>
                        <p className="text-gray-700">
                            <strong>Phone:</strong> {"member.Phone" || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Conditionally render the team member info only if teamMember is defined */}
            {firstReservation ? (
                <>
                    <h1 className="text-black PoppinsFont">The items below are to be deleted soon. Leaving them for now to keep up with how to access reservations. - Lilly</h1>
                    <div className="w-[1524px] h-[806px] relative">
                        <div className="w-[1524px] h-[806px] left-0 top-0 absolute bg-[#f3f3f3] rounded-[10px]"></div>
                        <div className="w-[324px] h-[37px] left-[17px] top-[14px] absolute bg-[#d9d9d9] rounded-[10px]"></div>
                        <div className="left-[26px] top-[21px] absolute text-black text-2xl font-medium font-['Poppins'] leading-normal">Oct. 7th - Oct. 13th, 2024</div>
                        <div className="w-6 h-6 left-[317px] top-[21px] absolute"></div>
                        <div className="w-[1101px] h-[724px] left-[17px] top-[63px] absolute bg-white rounded-[10px]"></div>
                        <div className="w-[262px] h-6 left-[115px] top-[152px] absolute bg-[#9e1b32] rounded-[5px]"></div>
                        <div className="w-[239px] h-6 left-[115px] top-[208px] absolute bg-[#9e1b32] rounded-[5px]"></div>
                        <div className="w-[1101px] h-[0px] left-[17px] top-[99px] absolute border border-black"></div>
                        <div className="left-[26px] top-[70px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">Time</div>
                        <div className="w-[724px] h-[0px] left-[111px] top-[63px] absolute origin-top-left rotate-90 border border-black"></div>
                        <div className="w-[724px] h-[0px] left-[392px] top-[63px] absolute origin-top-left rotate-90 border border-black"></div>
                        <div className="w-[724px] h-[0px] left-[587px] top-[63px] absolute origin-top-left rotate-90 border border-black"></div>
                        <div className="left-[26px] top-[99px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">7:00am</div>
                        <div className="left-[118px] top-[99px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">{firstReservation.Fname}</div>
                        <div className="left-[399px] top-[99px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">etc...</div>
                        <div className="left-[118px] top-[123px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">{secondReservation?.Fname}</div>
                        <div className="left-[115px] top-[180px] absolute text-black text-base font-medium font-['Poppins'] leading-normal"></div>
                        <div className="left-[115px] top-[260px] absolute text-black text-base font-medium font-['Poppins'] leading-normal"></div>
                        <div className="left-[118px] top-[208px] absolute text-white text-base font-medium font-['Poppins'] leading-normal"></div>
                        <div className="left-[118px] top-[152px] absolute text-white text-base font-medium font-['Poppins'] leading-normal"></div>
                        <div className="left-[26px] top-[152px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">7:30am</div>
                        <div className="left-[28px] top-[180px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">7:45am</div>
                        <div className="left-[26px] top-[123px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">7:15am</div>
                        <div className="w-[1101px] h-[0px] left-[17px] top-[123px] absolute border border-black"></div>
                        <div className="w-[1102px] h-[0px] left-[16px] top-[147px] absolute border border-black"></div>
                        <div className="w-[1102px] h-[0px] left-[16px] top-[180px] absolute border border-black"></div>
                        <div className="left-[28px] top-[208px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">8:00am</div>
                        <div className="left-[28px] top-[260px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">5:00pm</div>
                        <div className="left-[29px] top-[236px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">etc...</div>
                        <div className="w-[1102px] h-[0px] left-[16px] top-[204px] absolute border border-black"></div>
                        <div className="w-[1102px] h-[0px] left-[16px] top-[236px] absolute border border-black"></div>
                        <div className="w-[1102px] h-[0px] left-[16px] top-[260px] absolute border border-black"></div>
                        <div className="left-[118px] top-[70px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">Monday</div>
                        <div className="left-[399px] top-[69px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">Tuesday</div>
                        <div className="left-[594px] top-[69px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">Wednesday</div>
                        <div className="w-[724px] h-[0px] left-[773px] top-[63px] absolute origin-top-left rotate-90 border border-black"></div>
                        <div className="left-[780px] top-[69px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">Thursday</div>
                        <div className="w-[724px] h-[0px] left-[934px] top-[63px] absolute origin-top-left rotate-90 border border-black"></div>
                        <div className="left-[941px] top-[69px] absolute text-black text-base font-medium font-['Poppins'] leading-normal">Friday</div>
                    </div>  
                </>
            ) : (
                <div>No reservation data available.</div>
            )}
        </div>
    );
}
