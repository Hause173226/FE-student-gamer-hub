import React, { useState, useEffect, useCallback } from "react";
import { Search, X, UserPlus, Check, Clock, Loader2 } from "lucide-react";
import friendService, { UserSearchResult } from "../services/friendService";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Debounced search - ALWAYS refresh from backend
  const searchUsers = useCallback(async (searchQuery: string, page = 1) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setTotalPages(1);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await friendService.searchUsers({
        q: searchQuery,
        Page: page,
        Size: 20,
      });

      // ✅ Backend ALWAYS returns fresh IsPending & IsFriend status
      setResults(response.Items);
      setTotalPages(response.TotalPages);
      setTotalCount(response.TotalCount);
      setCurrentPage(response.Page);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(
        err?.response?.data?.message || "Không thể tìm kiếm. Vui lòng thử lại."
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Search on query change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchUsers]);

  const handleInvite = async (userId: string) => {
    try {
      await friendService.inviteFriend(userId);

      // ✅ Update local state immediately for better UX
      setResults((prev) =>
        prev.map((user) =>
          user.UserId === userId ? { ...user, IsPending: true } : user
        )
      );

      alert("✅ Đã gửi lời mời kết bạn!");
    } catch (err: any) {
      console.error("❌ Friend request failed:", err);

      const status = err?.response?.status;
      const errorMessage = err?.response?.data?.message || "";

      let userMessage = "Không thể gửi lời mời";

      // ✅ Handle specific error cases
      if (status === 403) {
        if (errorMessage.toLowerCase().includes("pending")) {
          userMessage = "Đã có lời mời đang chờ xử lý.";
          // ✅ Sync state if backend says pending
          setResults((prev) =>
            prev.map((user) =>
              user.UserId === userId ? { ...user, IsPending: true } : user
            )
          );
        } else if (errorMessage.toLowerCase().includes("friend")) {
          userMessage = "Đã là bạn bè.";
          setResults((prev) =>
            prev.map((user) =>
              user.UserId === userId ? { ...user, IsFriend: true } : user
            )
          );
        } else {
          userMessage =
            "Không thể gửi lời mời. Có thể bạn đã gửi trước đó hoặc đã bị từ chối.";
        }
      } else if (status === 409) {
        userMessage = "Đã có quan hệ bạn bè hoặc lời mời đang chờ.";
        // ✅ Refresh to get real state
        await searchUsers(query, currentPage);
      }

      alert(`❌ ${userMessage}`);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      searchUsers(query, currentPage + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, username, trường..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
          />
          {loading && (
            <Loader2 className="animate-spin text-indigo-500" size={20} />
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Count */}
        {totalCount > 0 && (
          <div className="px-4 py-2 bg-slate-900/50 text-sm text-slate-400">
            Tìm thấy {totalCount} kết quả cho "{query}"
          </div>
        )}

        {/* Results */}
        <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
          {error && <div className="p-4 text-center text-red-400">{error}</div>}

          {!loading && query.length < 2 && (
            <div className="p-8 text-center text-slate-400">
              <Search size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nhập ít nhất 2 ký tự để tìm kiếm</p>
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && !error && (
            <div className="p-8 text-center text-slate-400">
              <Search size={48} className="mx-auto mb-3 opacity-50" />
              <p>Không tìm thấy kết quả cho "{query}"</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              {results.map((user) => (
                <div
                  key={user.UserId}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {/* Avatar */}
                  {user.AvatarUrl ? (
                    <img
                      src={user.AvatarUrl}
                      alt={user.FullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {user.FullName.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      {user.FullName}
                    </h3>
                    <p className="text-sm text-slate-400 truncate">
                      @{user.UserName}
                      {user.University && ` • ${user.University}`}
                    </p>
                  </div>

                  {/* Action Button */}
                  {user.IsFriend ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm font-medium">
                      <Check size={16} />
                      Bạn bè
                    </span>
                  ) : user.IsPending ? (
                    <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
                      <Clock size={16} />
                      Đã gửi
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInvite(user.UserId)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
                    >
                      <UserPlus size={16} />
                      Kết bạn
                    </button>
                  )}
                </div>
              ))}

              {/* Load More */}
              {currentPage < totalPages && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Đang tải..." : "Tải thêm"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
