import React from "react";
import { Link } from "react-router-dom";
import image from "../assets/3d-calculator.png"; // Import image
import bgimage from "../assets/background-blob.png"


function WelcomePage() {
return (
  <div className="relative lg:pl-36 flex-col min-h-screen bg-custom-gradient text-white overflow-hidden -z-0">
  {/* Positioned Background Image in the Top Right, Behind Content */}
  <img
  src={bgimage}
  alt="Background decoration"
  className="hidden lg:block absolute right-0 w-6/12 h-auto -z-10"
/>

  {/* Header */}
  <header className="flex justify-between items-center p-6 lg:pr-36">
    <h1 className="self-stretch my-auto text-5xl text-white max-md:text-4xl">
      <span className="font-extrabold text-blue-400">Fin</span>
      <span className="font-extrabold text-orange-400">Trac</span>
    </h1>
    <div className="space-x-4">
    <Link to="/login">
      <button className="overflow-hidden self-stretch px-9 py-4 my-auto w-30 rounded-full max-md:px-5 border border-blue-400 bg-blue-400 hover:bg-blue-500">
        Login
      </button>
      </Link>
      <Link to="/signup">
      <button className="overflow-hidden self-stretch px-9 py-4 my-auto rounded-full max-md:px-5 border border-orange-400 text-orange-100 hover:bg-orange-400 hover:text-white">
        Sign Up
      </button>
      </Link>
    </div>
  </header>

  {/* Main Content */}
  <section className="flex flex-col-reverse lg:flex-row justify-between items-center lg:pl-3 px-6 lg:px-12 py-6">
    <div className="flex flex-col-reverse lg:flex-row items-center justify-between w-full lg:max-w-full">
    <div className="flex overflow-hidden flex-col w-[500px] max-md:max-w-full">
        <h1 className="text-5xl font-extrabold text-white leading-[80px] max-md:max-w-full max-md:text-4xl max-md:leading-[71px]">
          Financial Tracker Made <span className="text-blue-400">By</span> Students Made <span className="text-orange-400">For</span> Students
        </h1>
        <h4 className="mt-6 lg:mt-9 text-lg lg:text-xl font-medium leading-8 text-white max-md:max-w-full">
          FinTrac helps students manage budgets, track expenses, and improve financial literacy effortlessly.
        </h4>
        <div className="flex flex-col lg:flex-row gap-2.5 items-center mt-6 lg:mt-9 text-sm font-bold text-center lg:text-left">
          <Link to="/login">
          <button className="px-9 py-4 rounded-full border border-blue-400 bg-blue-400 hover:bg-blue-500 w-full lg:w-auto">
            Login
          </button>
          </Link>
          <Link to="/signup">
          <button className="px-9 py-4 rounded-full border border-orange-400 text-orange-100 hover:bg-orange-400 hover:text-white w-full lg:w-auto">
            Sign Up
          </button>
          </Link>
        </div>
      </div>

      {/* Illustration Image */}
      <img
  loading="eager"
  src={image}
  alt="Financial tracking illustration"
  className="lg:block object-contain w-full lg:w-[45%] mt-6 lg:mt-0 aspect-w-16 aspect-h-9"
/>
    </div>
  </section>
</div>
);
}

export default WelcomePage;