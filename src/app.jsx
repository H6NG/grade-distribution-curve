import { useState, useRef, useEffect } from 'react';
import { Chart as c, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import * as ss from 'simple-statistics';

c.register({
    CategoryScale, LinearScale, PointElement, LineElement, Filler
});

export default function App() {

    const [input, setInput] = useState({
        max_point_on_exam: "",
        min_point_on_exam: "",
        user_grade: "",
        num_stud: "",
        mean: "",
        high: "",
        low: "",
        upper_q: "",
        lower_q: "",
        median: "",
        sure: []
    });

    const [data, setData] = useState([]);
    const [inputClicked, setInputClicked] = useState(false);

    // parsing inputs: 

    // Add separate state variables for each curve at the top of your component
    const [synthData, setSynthData] = useState([]);
    const [piecewiseData, setPiecewiseData] = useState([]);
    const [gaussianData, setGaussianData] = useState([]);

    useEffect(() => {
        const min = Number(input.min_point_on_exam) || 0;
        const max = Number(input.max_point_on_exam) || 100;
        const meanVal = Number(input.mean) || 0;
        const medianVal = Number(input.median) || 0;
        const low = Number(input.low) || 0;
        const high = Number(input.high) || 100;
        const q1 = Number(input.lower_q) || 0;
        const q3 = Number(input.upper_q) || 0;
        const numStud = Number(input.num_stud) || 1;

        const pointsCount = max - min + 1;
        if (pointsCount <= 1) return;
        const xs = Array.from({ length: pointsCount }, (_, i) => min + i);
        const rawSynth = xs.map(x => synth(x, low, high, meanVal, medianVal));
        const rawPiecewise = xs.map(x => piecewise(x, low, q1, medianVal, q3, high));

        const estimatedStdDev = Math.max((high - low) / 4, 1);
        const rawGaussian = xs.map(x => gaussian(x, meanVal, estimatedStdDev));
        const scaleToStudents = (rawArray) => {
            const total = rawArray.reduce((a, b) => a + b, 0);
            return total > 0 ? rawArray.map(y => (y / total) * numStud) : rawArray;
        };

        setSynthData(scaleToStudents(rawSynth));
        setPiecewiseData(scaleToStudents(rawPiecewise));
        setGaussianData(scaleToStudents(rawGaussian));

    }, [input]);

    /* basic calculations */


    /**Technique de distribution: 
     * 
     * Reconstruction de distribution synthetique
     * La courbe de cloche (fitted Gaussian/Bell Curve)
     * histogramme empirical hybride avec synthetique. 
     * Percentile mapping model 
     * piecewise distribution curve.
    */

    // Attempt to generate data : confidence percent and intervals are questionable. Is raw data reliable. Questionable.
    const [generateDataArray, setGenerateDataArray] = useState([]);
    const generateData = (e) => {
        setGenerateDataArray(prev => [...prev,
        input.high,
        input.low,
        input.median,
        input.upper_q,
            input
        ])
    }

    // Create functions 

    function gaussian(x, mean, std) {
        return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
    }
    function synth(x, low, high, mean, median) {
        let t = (x - low) / (high - low);
        if (t <= 0 || t >= 1) return 0;
        let skew = mean - median;
        let alpha = 2 + skew * 2;
        let beta = 2 - skew * 2;
        return Math.pow(t, alpha - 1) * Math.pow(1 - t, beta - 1);
    }

    function piecewise(x, low, q1, median, q3, high) {
        const segments = [
            [(low + q1) / 2, q1 - low],
            [(q1 + median) / 2, median - q1],
            [(median + q3) / 2, q3 - median],
            [(q3 + high) / 2, high - q3],
        ];

        let sum = 0;
        for (const [mu, width] of segments) {
            const s = Math.max(width / 4, 1);
            sum += gaussian(x, mu, s);
        }
        return sum;
    }
    function percentile(x, low, q1, median, q3, high) {
        const pts = [
            [low, 0],
            [q1, 0.25],
            [median, 0.5],
            [q3, 0.75],
            [high, 1]
        ];

        for (let i = 0; i < pts.length - 1; i++) {
            const [x1, y1] = pts[i];
            const [x2, y2] = pts[i + 1];

            if (x >= x1 && x <= x2) {
                return (y2 - y1) / (x2 - x1);
            }
        }
        return 0;
    }

    // define functions
    const mean = (data) => { return data.reduce((a, b) => a + b, 0) / data.length };

    // we need to make sure data.length = num_stud
    const median = (data) => {
        const sorted = [...data].sort((a, b) => a - b);
        const s = sorted.length;
        if (s === 0) return 0;
        if (s % 2 === 1) return sorted[Math.floor(s / 2)]
        else return (sorted[Math.floor(s / 2) - 1] + sorted[Math.floor(s / 2)]) / 2;
    };


    // Chart

    const min = Number(input.min_point_on_exam);
    const max = Number(input.max_point_on_exam);
    const labels_arr = [];
    for (let i = min; i <= max; i++) {
        labels_arr.push(i);
    }

    const ch = {
        labels: labels_arr,
        datasets: [
            {
                label: "Beta Model (Synth)",
                data: synthData,
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.25)",
                fill: true,
                tension: 0.4
            },
            {
                label: "Piecewise Quartile Model",
                data: piecewiseData,
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.25)",
                fill: true,
                tension: 0.4
            },
            {
                label: "Standard Bell Curve",
                data: gaussianData,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.25)",
                fill: true,
                tension: 0.4
            }
        ]
    };

    const handleSubmit = (e) => {

        e.preventDefault();
        console.log(labels_arr);
        console.log(input.sure);
        setInputClicked(false);
    };

    const handleReset = (e) => {

        e.preventDefault();
        setInput({
            max_point_on_exam: "",
            min_point_on_exam: "",
            user_grade: "",
            num_stud: "",
            mean: "",
            high: "",
            low: "",
            upper_q: "",
            lower_q: "",
            median: "",
            sure: []
        });
    }
    const removeGrade = (indexToRemove) => {
        setInput(prev => ({
            ...prev,
            sure: prev.sure.filter((_, i) => i !== indexToRemove)
        }));
    };

    return (
        <>
            {inputClicked && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg border border-black p-4 sm:p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl rounded-md">
                        <p className='font-mono font-bold text-lg'>Your Input</p>

                        <div className='flex flex-col gap-3'>
                            <p className='font-mono text-xs text-gray-500 uppercase tracking-wide'>Exam</p>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Max points</label>
                                    <input type="number" value={input.max_point_on_exam} onChange={e => setInput({ ...input, max_point_on_exam: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='e.g. 100' />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Min points</label>
                                    <input type="number" value={input.min_point_on_exam} onChange={e => setInput({ ...input, min_point_on_exam: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='e.g. 0' />
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='font-mono text-sm'>Your grade</label>
                                <input type="number" value={input.user_grade} onChange={e => setInput({ ...input, user_grade: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='e.g. 77' />
                            </div>
                        </div>

                        <div className='flex flex-col gap-3'>
                            <p className='font-mono text-xs text-gray-500 uppercase tracking-wide'>Class Statistics</p>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Number of students</label>
                                    <input type="number" value={input.num_stud} onChange={e => setInput({ ...input, num_stud: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='e.g. 30' />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Mean</label>
                                    <input type="number" value={input.mean} onChange={e => setInput({ ...input, mean: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='e.g. 65' />
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>High</label>
                                    <input type="number" value={input.high} onChange={e => setInput({ ...input, high: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='e.g. 98' />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Low</label>
                                    <input type="number" value={input.low} onChange={e => setInput({ ...input, low: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='e.g. 20' />
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-3'>
                            <p className='font-mono text-xs text-gray-500 uppercase tracking-wide'>Distribution</p>
                            <div className='grid grid-cols-3 gap-2 sm:gap-3'>
                                <div className='flex flex-col gap-1'>
                                    <label className='font-mono text-[11px] sm:text-sm whitespace-nowrap'>Upper Q</label>
                                    <input type="number" value={input.upper_q} onChange={e => setInput({ ...input, upper_q: e.target.value })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='80' />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <label className='font-mono text-[11px] sm:text-sm'>Median</label>
                                    <input type="number" value={input.median} onChange={e => setInput({ ...input, median: e.target.value })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='68' />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <label className='font-mono text-[11px] sm:text-sm whitespace-nowrap'>Lower Q</label>
                                    <input type="number" value={input.lower_q} onChange={e => setInput({ ...input, lower_q: e.target.value })} className='border border-black p-2 font-mono focus:outline-none w-full text-sm' placeholder='55' />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <p className="font-mono text-xs text-gray-500 uppercase tracking-wide">Known Grades (Sure List)</p>
                            <input type="number" placeholder="Enter a grade and press Add" id="sureInput" className="border border-black p-2 font-mono text-sm" />
                            <button
                                type="button"
                                onClick={() => {
                                    const val = Number(document.getElementById("sureInput").value);
                                    if (!isNaN(val)) {
                                        setInput(prev => ({ ...prev, sure: [...prev.sure, val] }));
                                    }
                                    document.getElementById("sureInput").value = "";
                                }}
                                className="border border-black px-3 py-1 font-mono text-sm hover:bg-gray-100"
                            >
                                Add Grade
                            </button>
                            <div className="flex flex-wrap gap-2">
                                {input.sure.map((g, i) => (
                                    <span key={i} onClick={() => removeGrade(i)} className="border border-black px-2 py-1 text-xs font-mono cursor-pointer hover:bg-red-100 hover:border-red-500">
                                        {g} ✕
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className='flex justify-end gap-2 pt-2 border-t border-gray-100'>
                            <button type="button" onClick={() => setInputClicked(false)} className='border border-black px-4 py-2 font-mono text-sm cursor-pointer hover:bg-gray-100'>Cancel</button>
                            <button type="submit" className='bg-black text-white px-4 py-2 font-mono text-sm cursor-pointer hover:bg-gray-800'>Submit</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 min-h-screen flex flex-col justify-start">
                <div className='flex flex-col gap-4 sm:flex-row justify-between items-stretch sm:items-center mb-8 sm:mb-12 shrink-0'>
                    <div className='bg-white border border-black p-3 h-20 flex items-center justify-center sm:w-60'>
                        <p className='font-mono text-sm text-center font-bold'>grade-distribution-curve</p>
                    </div>
                    <div className='flex gap-4 h-20'>
                        <button onClick={handleReset} className='bg-white border border-black p-3 flex-1 sm:w-30 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors'>
                            <p className='font-mono text-sm'>Reset</p>
                        </button>
                        <button onClick={() => setInputClicked(true)} className='bg-white border border-black p-3 flex-1 sm:w-30 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors'>
                            <p className='font-mono text-sm font-bold'>INPUT</p>
                        </button>
                    </div>
                </div>
                <div className='bg-white border border-black p-2 sm:p-6 w-full h-[60vh] min-h-[400px] max-h-[600px] mb-10 relative flex-1'>
                    <Line
                        data={ch}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                        text: 'Score',
                                        font: { family: 'monospace' }
                                    }
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Number of students',
                                        font: { family: 'monospace' }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>

            <footer></footer>
        </>
    )
}