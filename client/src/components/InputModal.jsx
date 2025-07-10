import { useState } from "react";

function InputModal(props) {
    const [inputValue, setInputValue] = useState("");

    function handleSubmit() {
        if (!inputValue) return;
        props.onSubmit(inputValue);
    }

    return (
        <div className="bg-black bg-opacity-40 fixed w-screen h-screen z-50 top-0 left-0">
            <div className="bg-gray-800 fixed w-full max-w-md h-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl flex flex-col gap-6 p-8">
                <h1 className="text-2xl font-extrabold text-white text-center">{props.title}</h1>
                <input
                    type="text"
                    placeholder={props.placeholder || ""}
                    className="bg-gray-700 hover:bg-gray-700 placeholder-gray-400 text-white rounded-lg p-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    onChange={(event) => setInputValue(event.target.value)}
                />
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200" onClick={handleSubmit}>
                    Submit
                </button>
            </div>
        </div>
    )
}

export default InputModal;