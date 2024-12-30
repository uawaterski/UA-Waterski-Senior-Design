"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';
import { fetchSheetData } from "../googlesheetservices";
import svgOne from "../../components/img/team-news-page-1.svg";

export default function TeamNewsPage() {
    const [error, setError] = useState<string | null>(null);
    const [headerPhoto, setHeaderPhoto] = useState<string | null>(null);
    const [newsLetterHeader, setNewsLetterHeader] = useState<string[]>([]);
    const [newsLetterImg, setNewsLetterImg] = useState<string[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    useEffect(() => {
        const getData = async () => {
            try {
                const data = await fetchSheetData("TeamNewsPage");
                if (data) {
                    // Extract Header Photo (A2)
                    const headerPhoto = data[1][0]?.startsWith("http") ? data[1][0] : null;
                    setHeaderPhoto(headerPhoto);

                    // Extract Newsletter Headers and Images starting from row 4
                    const slicedData = data.slice(4); // Start from row 4
                    const newsLetterHeader = slicedData.map((row) => row[0]).filter((header) => header); // Column A
                    const newsLetterImg = slicedData.map((row) => row[1]).filter((url) => url?.startsWith("http")); // Column B

                    setNewsLetterHeader(newsLetterHeader);
                    setNewsLetterImg(newsLetterImg);

                    console.log("Headers:", newsLetterHeader);
                    console.log("Images:", newsLetterImg);
                } else {
                    setNewsLetterHeader([]);
                    setNewsLetterImg([]);
                }
            } catch (err) {
                console.error("Error fetching sheet data:", err);
                setError("Failed to fetch data");
            }
        };

        getData();
    }, []);

    return (
        <div>
            <section className="container mx-auto px-4 py-20">
                <div className="flex justify-between items-center mb-12">
                    <div className="text-left">
                        <h1 className="text-5xl font-extrabold text-[#9E1B32] mb-6">Team Newsletter</h1>
                        <p className="text-lg text-gray-700 max-w-3xl">
                            Stay up to date on the latest news and updates from our team.
                        </p>
                    </div>
                    <div className="flex justify-center items-center w-1/2">
                        {headerPhoto && (
                            <img
                                src={headerPhoto}
                                alt="Header Photo"
                                width={400}
                                height={200}
                                className="rounded-lg shadow-lg mb-10"
                            />
                        )}
                    </div>
                </div>
                
                <div className="border-t border-[#9E1B32] my-12"></div>
                <div className="flex flex-col space-y-6 mt-10">
                    {newsLetterHeader.length > 0 && newsLetterImg.length > 0
                        ? newsLetterHeader.map((header, index) => {
                            const imageUrl = newsLetterImg[index];
                            if (!imageUrl) return null;

                            return (
                                <div key={index} className="flex flex-col items-start bg-gray-100 p-6 rounded-lg shadow-md">
                                    <button
                                        className="text-md text-black text-left w-full flex items-center justify-between focus:outline-none"
                                        onClick={() => setExpandedIndex((prev) => (prev === index ? null : index))}
                                    >
                                        <p className="font-semibold">{header}</p>
                                        <span className="text-gray-500">{expandedIndex === index ? '-' : '+'}</span>
                                    </button>
                                    {expandedIndex === index && (
                                        <div className="flex justify-center w-full mt-4">
                                            <img
                                                src={imageUrl}
                                                alt={`Image ${index + 1}`}
                                                className="h-auto w-auto object-contain pointer-events-none rounded-lg shadow-lg"
                                                style={{
                                                    width: "50%",
                                                    maxWidth: "50%",
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                        : !error && <p className="text-gray-500 text-center">No images to display at the moment.</p>}
                </div>
            </section>
        </div>
    );
}