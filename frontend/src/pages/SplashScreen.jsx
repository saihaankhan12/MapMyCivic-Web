import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";

function SplashScreen() {
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setShowText(true);
    }, 1000);

    setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    setTimeout(() => {
      navigate("/signin");
    }, 4000);
  }, [navigate]);

  return (
    <div
      className={`h-screen w-full flex flex-col items-center justify-center bg-white transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img src={logo} alt="logo" className="w-40 mb-6 animate-pulse" />

      {showText && (
        <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">
          MapMyCivic
        </h1>
      )}
    </div>
  );
}

export default SplashScreen;