import React, { useState } from "react";
import { FiX, FiInfo } from "react-icons/fi";

const BulkUpdateForm = ({ onClose }) => {
  const [updateMethod, setUpdateMethod] = useState("csv");
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      // In a real application, you would process the CSV data or file here
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: "blur(4px)" }}
    >
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderRadius: "var(--rounded-lg)",
        }}
      >
        <div
          className="flex justify-between items-center p-6 border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Bulk Update Inventory
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div
              className="p-4 border rounded-lg flex items-start space-x-3"
              style={{
                backgroundColor: "var(--bg-accent-light)",
                borderColor: "var(--border-primary)",
                borderRadius: "var(--rounded-lg)",
              }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <FiInfo size={18} style={{ color: "var(--brand-primary)" }} />
              </div>
              <div>
                <h3
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Instructions
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Bulk update stock by uploading a CSV file or pasting CSV data.
                  The CSV should have columns for SKU and Stock Quantity.
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Example format: <code>SKU,Stock Quantity</code>
                </p>
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <a
                    href="#"
                    className="underline"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    Download sample CSV file
                  </a>
                </p>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Update Method
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="csv-file"
                    name="update-method"
                    value="csv"
                    checked={updateMethod === "csv"}
                    onChange={() => setUpdateMethod("csv")}
                    className="h-4 w-4"
                    style={{ color: "var(--brand-primary)" }}
                  />
                  <label
                    htmlFor="csv-file"
                    className="ml-2 block text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Upload CSV file
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="paste-csv"
                    name="update-method"
                    value="paste"
                    checked={updateMethod === "paste"}
                    onChange={() => setUpdateMethod("paste")}
                    className="h-4 w-4"
                    style={{ color: "var(--brand-primary)" }}
                  />
                  <label
                    htmlFor="paste-csv"
                    className="ml-2 block text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Paste CSV data
                  </label>
                </div>
              </div>
            </div>

            {updateMethod === "csv" ? (
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  CSV File
                </label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center"
                  style={{
                    borderColor: "var(--border-primary)",
                    borderRadius: "var(--rounded-lg)",
                  }}
                >
                  <input
                    type="file"
                    id="csv-upload"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer block">
                    <div
                      className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-3"
                      style={{ backgroundColor: "var(--bg-accent-light)" }}
                    >
                      <svg
                        className="h-6 w-6"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 24 24"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {file ? file.name : "Click to upload CSV file"}
                    </span>
                    {!file && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        or drag and drop
                      </p>
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="csv-data"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  CSV Data
                </label>
                <textarea
                  id="csv-data"
                  rows="8"
                  className="w-full p-2 border rounded-md"
                  style={{
                    borderColor: "var(--border-primary)",
                    borderRadius: "var(--rounded-md)",
                  }}
                  placeholder="SKU,Stock Quantity
IP13PM-256-GR,10
SGS22U-256-BK,15"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                ></textarea>
              </div>
            )}
          </div>

          <div
            className="p-6 border-t flex justify-end space-x-3"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-sm font-medium"
              style={{
                borderColor: "var(--border-primary)",
                color: "var(--text-primary)",
                borderRadius: "var(--rounded-md)",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-md text-sm font-medium flex items-center justify-center min-w-[120px]"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "var(--text-on-brand)",
                borderRadius: "var(--rounded-md)",
              }}
              disabled={
                isSubmitting ||
                (updateMethod === "csv" && !file) ||
                (updateMethod === "paste" && !csvData)
              }
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Update Stock"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkUpdateForm;
