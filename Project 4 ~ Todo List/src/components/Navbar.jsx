import React from 'react'

const Navbar = () => {
    return (
        <>
            <nav className='flex justify-around bg-emerald-600 text-white py-2'>
               <div className="logo">
                <span className='text-2xl mx-4 font-bold'>iTask</span>
                </div> 
                <ul className='flex gap-10 mx-9'>
                    <li className='cursor-pointer  transition-all hover:scale-[1.1] hover:font-bold'>Home</li>
                    <li className='cursor-pointer transition-all hover:scale-[1.1]  hover:font-bold'>Your Task</li>
                </ul>
            </nav>
        </>
    )
}

export default Navbar
