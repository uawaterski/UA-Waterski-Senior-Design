"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { fetchSheetData } from "../googlesheetservices";
import svgOne from "../../components/img/team-records-page-1.svg";

interface TeamRecord {
    event: string;
    holder: string;
    record: string;
}

interface TeamHistoryRecord {
    year: string;
    placement: string;
}

export default function TeamNewsPage() {
    const [error, setError] = useState<string | null>(null);
    const [headerPhoto, setHeaderPhoto] = useState<string | null>(null);
    const [mensRecords, setMensRecords] = useState<TeamRecord[]>([]);
    const [womensRecords, setWomensRecords] = useState<TeamRecord[]>([]);
    const [teamHistory, setTeamHistory] = useState<TeamHistoryRecord[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await fetchSheetData("TeamRecordsPage");
                if (data) {

                    // Extract Header Photo
                    const headerPhoto = data[1]?.[0];
                    if (headerPhoto?.startsWith("http")) {
                        setHeaderPhoto(headerPhoto);
                    } else {
                        console.warn("Header Photo URL is invalid:", headerPhoto);
                        setHeaderPhoto(null); // Set to null if the data is not valid
                    }
                    
                    //Extract Men's Team Records (Rows 8-10)
                    const mensRecords = data.slice(4, 7).map((row) => ({
                        event: row[0],
                        holder: row[1],
                        record: row[2],
                    }));
                    setMensRecords(mensRecords);

                    // Extract Women's Team Records (Rows 13-15)
                    const womensRecords = data.slice(9, 12).map((row) => ({
                        event: row[0],
                        holder: row[1],
                        record: row[2],
                    }));
                    setWomensRecords(womensRecords);

                    //Extract Men's Team Records (Rows 8-10)
                    const teamHistory = data.slice(14).map((row) => ({
                        year: row[0],
                        placement: row[1],
                    }));
                    setTeamHistory(teamHistory);

                    console.log("Men's Records:", mensRecords);
                    console.log("Women's Records:", womensRecords);
                    console.log("Team's History:", teamHistory);
                    console.log("Fetched Data:", data);

                } else {
                    setMensRecords([]);
                    setWomensRecords([]);
                    setTeamHistory([]);
                }

            } catch (err) {
                console.error("Error fetching sheet data:", err);
                setError("Failed to fetch data");
            }
        };

        getData();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <section className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-[#9E1B32] mb-6">Our Team Records</h1>
                    <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                        Celebrating the achievements of our men&#39;s and women&#39;s teams.
                    </p>
                </div>

                <div className="flex justify-center">
                    {headerPhoto && (
                        <img
                            src={headerPhoto}
                            alt="Header Photo"
                            className="w-1/2 h-1/2 rounded-lg shadow-lg mb-10"
                        />
                    )}
                </div>

                {/* Team Records Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Men's Records */}
                    <div>
                        <h3 className="text-2xl font-bold text-[#9E1B32] mb-4">Men&#39;s Team Records</h3>
                        <table className="table-auto w-full text-left border-collapse border border-gray-300 bg-white shadow-md rounded-lg">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 text-black px-4 py-2">Event</th>
                                    <th className="border border-gray-300 text-black px-4 py-2">Record Holder</th>
                                    <th className="border border-gray-300 text-black px-4 py-2">Record</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mensRecords.length > 0 ? (
                                    mensRecords.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="border border-gray-300 text-gray-900 px-4 py-2">{record.event}</td>
                                            <td className="border border-gray-300 text-gray-500 px-4 py-2">{record.holder}</td>
                                            <td className="border border-gray-300 text-gray-500 px-4 py-2">{record.record}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4">
                                            No men&#39;s records available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Women's Records */}
                    <div>
                        <h3 className="text-2xl font-bold text-[#9E1B32] mb-4">Women&#39;s Team Records</h3>
                        <table className="table-auto w-full text-left border-collapse border border-gray-300 bg-white shadow-md rounded-lg">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 text-black px-4 py-2">Event</th>
                                    <th className="border border-gray-300 text-black px-4 py-2">Record Holder</th>
                                    <th className="border border-gray-300 text-black px-4 py-2">Record</th>
                                </tr>
                            </thead>
                            <tbody>
                                {womensRecords.length > 0 ? (
                                    womensRecords.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <td className="border border-gray-300 text-gray-900 px-4 py-2">{record.event}</td>
                                            <td className="border border-gray-300 text-gray-500 px-4 py-2">{record.holder}</td>
                                            <td className="border border-gray-300 text-gray-500 px-4 py-2">{record.record}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4">
                                            No women&#39;s records available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="border-t border-[#9E1B32] my-12"></div>

                <div className="flex flex-col items-center justify-center">
                    {/* Team Historical Records Section */}
                    <div className="w-full md:w-1/2">
                        {/* Team Placement at Nationals */}
                        <div>
                            <h3 className="text-2xl font-bold text-[#9E1B32] mb-4 text-center">Team Placement at Nationals</h3>
                            <table className="table-auto w-full text-left border-collapse border border-gray-300 bg-white shadow-md rounded-lg">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 text-black px-4 py-2">Year</th>
                                        <th className="border border-gray-300 text-black px-4 py-2">Placement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teamHistory.length > 0 ? (
                                        teamHistory.map((record, index) => (
                                            <tr key={index} className="hover:bg-gray-100">
                                                <td className="border border-gray-300 text-gray-900 px-4 py-2">{record.year}</td>
                                                <td className="border border-gray-300 text-gray-500 px-4 py-2">{record.placement}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4">
                                                No team placement records available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </section>
        </div>
    );
}