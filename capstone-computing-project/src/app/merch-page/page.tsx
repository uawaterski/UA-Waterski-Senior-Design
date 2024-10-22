"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { fetchSheetData } from "../googlesheetservices";

export default function MerchPage() {
    const [image2A, setImage2A] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [sheetData, setSheetData] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const currentIndex = 4;

    useEffect(() => {
        // fetching data from Google Sheets
        const getData = async () => {
            try {
                const data = await fetchSheetData("MerchPage");
                if (data) {

                    const imageUrls = data
                        .filter((row) => row[0]?.startsWith("http"))
                        .map((row) => row[0])
                    setSheetData(imageUrls.slice(1));

                    console.log(sheetData);

                    const image2AUrl = data[1][0];
                    if (image2AUrl?.startsWith("http")){
                        setImage2A(image2AUrl);
                    } else {
                        setImage2A(null);
                    }

                } else {
                    setSheetData([]);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching sheet data:", err);
                setError("Failed to fetch data");
                setLoading(false);
            }
        };

        getData();
    }, []);

    

    return (
        <div className="min-h-screen flex flex-col">

            <Link href = "/">
                {image2A && (
                    <img 
                        src = {image2A}
                        alt = "Image from 2A" 
                        className = "h-200px w-200px md:h-250px md:w-250px lg:h-300px lg:w-300px max-w-full object-contain mr-20"
                    />
                )}
            </Link>

            {/* Section for smaller images */}
            <div className="flex flex-wrap justify-center space-x-4 mt-4">
                {!error && sheetData && sheetData.length > 0 && sheetData.slice(1).map((imageUrl, index) => (
                    <Link key={index} href="/" className="flex-shrink-0 w-1/4">
                        
                        <img 
                            src={imageUrl} 
                            alt={`Image ${index + 2}`} 
                            className="h-100px w-100px md:h-150px md:w-150px object-contain" // Adjust sizes as needed
                        />

                        <p className="mt-2 text-sm text-black">Image Label {index + 1}</p> {/* Label under each image */}
                        <p className="mt-2 text-sm text-black">Price {index + 1}</p> {/* Label under each image */}

                    </Link>
                ))}
            </div>

        </div>
    );
}
