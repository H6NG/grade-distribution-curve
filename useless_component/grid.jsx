import {useState, useRef, useEffect} from 'react';

{/* the layout seems so neat. try it yourself. */}

export default function grid() {

    return (
        <>
           <div className='grid grid-cols-4 gap-2'>
                <div className='bg-gray-400 p-2'>
                    <div className='grid grid-rows-4 gap-4'>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                    </div>
                </div>
                <div className='bg-amber-400 p-2'>
                    <div className='grid grid-rows-4 gap-4'>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                    </div>
                </div>
                <div className='bg-green-400 p-2'>
                    <div className='grid grid-rows-4 gap-4'>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                    </div>
                </div>
                <div className='bg-red-400 p-2'>
                    <div className='grid grid-rows-4 gap-4'>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                        <div className='bg-blue-600 p-2'>H</div>
                    </div>
                </div>
           </div>
        </>
    )
}