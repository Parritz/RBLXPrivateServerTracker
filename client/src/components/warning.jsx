function Warning(props) {
    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-6 shadow-sm">
            <p className="text-sm font-medium">
                {props.message}
            </p>
        </div>
    )
}

export default Warning;