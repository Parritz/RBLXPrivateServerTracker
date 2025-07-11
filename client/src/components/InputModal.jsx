import { useState, useEffect } from "react";

function InputModal(props) {
    const [inputValue, setInputValue] = useState("");

    function handleSubmit() {
        if (!inputValue) return;
        props.onSubmit(inputValue);
    }

    function handleClose() {
        if (props.onClose) {
            props.onClose();
        }
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            handleClose();
        } else if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [inputValue]);

    return (
        <div 
            className="bg-black bg-opacity-40 fixed w-screen h-screen z-50 top-0 left-0 flex items-center justify-center"
            onClick={handleBackdropClick}
        >
            <div className="bg-gray-800 w-full max-w-md h-auto rounded-2xl shadow-2xl flex flex-col gap-6 p-8 relative">
                {/* X Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200"
                    aria-label="Close modal"
                >
                    ×
                </button>
                
                <h1 className="text-2xl font-extrabold text-white text-center pr-8">{props.title}</h1>
                <input
                    type="text"
                    placeholder={props.placeholder || ""}
                    className="bg-gray-700 hover:bg-gray-700 placeholder-gray-400 text-white rounded-lg p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <button 
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200" 
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    )
}

export default InputModal;