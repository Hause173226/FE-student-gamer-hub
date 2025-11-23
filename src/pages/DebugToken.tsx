/**
 * Token Debug Page
 * Use this page to check if your JWT token contains user ID
 * Access at: /debug-token
 */

import { useEffect, useState } from "react";
import {
  debugToken,
  getUserInfoFromToken,
  decodeJwtToken,
} from "../utils/tokenUtils";

export default function DebugTokenPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [rawToken, setRawToken] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setRawToken(token);
      const info = getUserInfoFromToken(token);
      const decoded = decodeJwtToken(token);
      setTokenInfo({ ...info, decoded });

      // Also print to console
      debugToken(token);
    }
  }, []);

  const handleRefresh = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setRawToken(token);
      const info = getUserInfoFromToken(token);
      const decoded = decodeJwtToken(token);
      setTokenInfo({ ...info, decoded });
      debugToken(token);
    }
  };

  if (!rawToken) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Token Debug</h1>
          <div className="bg-red-500/20 border border-red-500 rounded p-4">
            <p className="font-semibold">❌ No token found in localStorage</p>
            <p className="text-sm text-gray-300 mt-2">Please login first</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">JWT Token Debug</h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            🔄 Refresh
          </button>
        </div>

        {/* User Info Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">User ID</p>
              <p className="font-mono text-lg">
                {tokenInfo?.userId ? (
                  <span className="text-green-400">✅ {tokenInfo.userId}</span>
                ) : (
                  <span className="text-red-400">❌ Not found</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Email</p>
              <p className="font-mono">
                {tokenInfo?.email || <span className="text-gray-500">N/A</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Name</p>
              <p className="font-mono">
                {tokenInfo?.name || <span className="text-gray-500">N/A</span>}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Token Status</p>
              <p className="font-mono">
                {tokenInfo?.isExpired ? (
                  <span className="text-red-400">❌ Expired</span>
                ) : (
                  <span className="text-green-400">✅ Valid</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Raw Token */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Raw Token</h2>
          <div className="bg-gray-900 rounded p-4 overflow-x-auto">
            <code className="text-sm text-green-400 break-all">{rawToken}</code>
          </div>
        </div>

        {/* Decoded Payload */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Decoded Payload</h2>
          <div className="bg-gray-900 rounded p-4 overflow-x-auto">
            <pre className="text-sm text-blue-400">
              {JSON.stringify(tokenInfo?.decoded, null, 2)}
            </pre>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-2">
            📝 How to find User ID in token:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li>Check the "Decoded Payload" section above</li>
            <li>
              Look for fields like:{" "}
              <code className="bg-gray-700 px-1 rounded">sub</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">userId</code>,{" "}
              <code className="bg-gray-700 px-1 rounded">nameid</code>, or{" "}
              <code className="bg-gray-700 px-1 rounded">id</code>
            </li>
            <li>
              If "User ID" shows ❌ Not found, check which field contains your
              user ID
            </li>
            <li>
              Update{" "}
              <code className="bg-gray-700 px-1 rounded">tokenUtils.ts</code> to
              read the correct field
            </li>
          </ul>
        </div>

        {/* Console Output */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 className="font-semibold mb-2">💻 Console Output</h3>
          <p className="text-sm text-gray-300">
            Check your browser console (F12) for detailed token information
            printed by{" "}
            <code className="bg-gray-700 px-1 rounded">debugToken()</code>
          </p>
        </div>
      </div>
    </div>
  );
}
