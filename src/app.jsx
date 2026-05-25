import { useState, useRef, useEffect } from 'react';
import { Chart as c, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { Line } from 'react-chartjs-2'

c.register({
    CategoryScale, LinearScale, PointElement, LineElement
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

    /* basic calculations */


    /**Technique de distribution: 
     * 
     * Reconstruction de distribution synthetique
     * La courbe de cloche (fitted Gaussian/Bell Curve)
     * histogramme empirical hybride avec synthetique. 
     * Percentile mapping model 
     * piecewise distribution curve.
    */



    // define functions
    const mean = (data) => { data.reduce((a, b) => a + b, 0) / data.length };

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
                label: "Grade Distribution",
                data: data,
                borderColor: "blue",
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
            {inputClicked &&

                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleSubmit} className="bg-white w-120 border border-black p-6 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl rounded-md">
                        <p className='font-mono font-bold text-lg'>Your Input</p>

                        <div className='flex flex-col gap-3'>
                            <p className='font-mono text-xs text-gray-500 uppercase tracking-wide'>Exam</p>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Max points</label>
                                    <input type="number" value={input.max_point_on_exam} onChange={e => setInput({ ...input, max_point_on_exam: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 100' />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Min points</label>
                                    <input type="number" value={input.min_point_on_exam} onChange={e => setInput({ ...input, min_point_on_exam: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 0' />
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='font-mono text-sm'>Your grade</label>
                                <input type="number" value={input.user_grade} onChange={e => setInput({ ...input, user_grade: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 77' />
                            </div>
                        </div>

                        <div className='flex flex-col gap-3'>
                            <p className='font-mono text-xs text-gray-500 uppercase tracking-wide'>Class Statistics</p>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Number of students</label>
                                    <input type="number" value={input.num_stud} onChange={e => setInput({ ...input, num_stud: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 30' />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Mean</label>
                                    <input type="number" value={input.mean} onChange={e => setInput({ ...input, mean: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 65' />
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>High</label>
                                    <input type="number" value={input.high} onChange={e => setInput({ ...input, high: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 98' />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Low</label>
                                    <input type="number" value={input.low} onChange={e => setInput({ ...input, low: (e.target.value) })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 20' />
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-3'>
                            <p className='font-mono text-xs text-gray-500 uppercase tracking-wide'>Distribution</p>
                            <div className='flex gap-3'>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Upper quartile</label>
                                    <input type="number" value={input.upper_q} onChange={e => setInput({ ...input, upper_q: e.target.value })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 80' />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Median</label>
                                    <input type="number" value={input.median} onChange={e => setInput({ ...input, median: e.target.value })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 68' />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='font-mono text-sm'>Lower quartile</label>
                                    <input type="number" value={input.lower_q} onChange={e => setInput({ ...input, lower_q: e.target.value })} className='border border-black p-2 font-mono focus:outline-none w-full' placeholder='e.g. 55' />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <p className="font-mono text-xs text-gray-500 uppercase tracking-wide">
                                Known Grades (Sure List)
                            </p>

                            <input
                                type="number"
                                placeholder="Enter a grade and press Add"
                                id="sureInput"
                                className="border border-black p-2 font-mono"
                            />

                            <button
                                type="button"
                                onClick={() => {
                                    const val = Number(document.getElementById("sureInput").value);

                                    if (!isNaN(val)) {
                                        setInput(prev => ({
                                            ...prev,
                                            sure: [...prev.sure, val]
                                        }));
                                    }

                                    document.getElementById("sureInput").value = "";
                                }}
                                className="border border-black px-3 py-1 font-mono hover:bg-gray-100"
                            >
                                Add Grade
                            </button>

                            <div className="flex flex-wrap gap-2">
                                {input.sure.map((g, i) => (
                                    <span
                                        key={i}
                                        onClick={() => removeGrade(i)}
                                        className="border border-black px-2 py-1 text-xs font-mono cursor-pointer hover:bg-red-100 hover:border-red-500"
                                    >
                                        {g} ✕
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className='flex justify-end gap-2'>
                            <button type="button" onClick={() => setInputClicked(false)} className='border border-black px-4 py-2 font-mono cursor-pointer hover:bg-gray-100'>Cancel</button>
                            <button type="submit" className='bg-black text-white px-4 py-2 font-mono cursor-pointer hover:bg-gray-800'>Submit</button>
                        </div>
                    </form>
                </div>

            }
            <div className="grid grid-rows-[auto_1fr] min-h-screen">

                <div className='flex justify-between items-center my-10 mx-30'>
                    <div className='bg-white border border-black p-3 w-60 h-20 flex items-center justify-center'>
                        <p className='font-mono text-sm'>grade-distribution-curve</p>
                    </div>
                    <div className='flex gap-4'>
                        <button onClick={handleReset} className='bg-white border border-black p-3 w-30 h-20 flex items-center justify-center cursor-pointer hover:bg-gray-200'>
                            <p className='font-mono text-sm'>Reset</p>
                        </button>
                        <button onClick={() => setInputClicked(true)} className='bg-white border border-black p-3 w-30 h-20 flex items-center justify-center cursor-pointer hover:bg-gray-200'>
                            <p className='font-mono text-sm'>INPUT</p>
                        </button>
                    </div>
                </div>

                <div className='bg-white border border-black p-4 mx-30 h-115'>
                    <Line data={ch} options={{
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
                    }} />
                </div>

            </div>

            <div>
                <p>Some numbers</p>
            </div>

            <footer>

            </footer>
        </>
    )
}