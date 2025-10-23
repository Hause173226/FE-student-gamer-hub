import { useState, useEffect } from "react";
import { Users, Plus, X } from "lucide-react";
import { ClubSummary, CreateClubPayload } from "../types/index.ts";
import ClubService from "../services/ClubService";

interface ClubListProps {
    communityId: string;
}

export function ClubList({ communityId }: ClubListProps) {
    const [clubs, setClubs] = useState<ClubSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State tạo club
    const [isCreating, setIsCreating] = useState(false);
    const [newClub, setNewClub] = useState<CreateClubPayload>({
        communityId,
        name: "",
        description: "",
        isPublic: true,
    });

    // Lấy danh sách club
    useEffect(() => {
        if (!communityId) return;

        const fetchClubs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await ClubService.getClubsByCommunityId(communityId);
                setClubs(response.Items || []);
            } catch (err) {
                console.error(`Lỗi khi tải clubs cho community ${communityId}:`, err);
                setError("Không thể tải danh sách club.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchClubs();
    }, [communityId]);

    // ✅ Tham gia club
    const handleJoinClub = async (clubId: string) => {
        try {
            const updatedClub = await ClubService.joinClub(clubId);
            setClubs((prev) =>
                prev.map((club) => (club.Id === clubId ? updatedClub : club))
            );
        } catch (err) {
            console.error("Lỗi khi tham gia club:", err);
            alert("Không thể tham gia club. Vui lòng thử lại!");
        }
    };

    // Tạo club mới
    const handleCreateClub = async () => {
        if (!newClub.name.trim()) {
            alert("Vui lòng nhập tên club!");
            return;
        }

        try {
            const created = await ClubService.createClub(newClub);
            setClubs((prev) => [...prev, created]);
            setIsCreating(false);
            setNewClub({ communityId, name: "", description: "", isPublic: true });
        } catch (err) {
            console.error("Lỗi khi tạo club:", err);
            alert("Tạo club thất bại. Vui lòng thử lại.");
        }
    };

    if (isLoading) {
        return <div className="text-center text-gray-400 p-6">Đang tải các club...</div>;
    }

    if (error) {
        return <div className="text-center text-red-400 p-6">{error}</div>;
    }

    return (
        <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Các Club trong Community</h3>
                {!isCreating ? (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tạo Club</span>
                    </button>
                ) : (
                    <button
                        onClick={() => setIsCreating(false)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                        <span>Hủy</span>
                    </button>
                )}
            </div>

            {/* Form tạo club */}
            {isCreating && (
                <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-3">Tạo Club mới</h4>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Tên club..."
                            value={newClub.name}
                            onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
                        />
                        <textarea
                            placeholder="Mô tả (tuỳ chọn)..."
                            value={newClub.description || ""}
                            onChange={(e) =>
                                setNewClub({ ...newClub, description: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
                        />
                        <label className="flex items-center space-x-2 text-gray-300">
                            <input
                                type="checkbox"
                                checked={newClub.isPublic}
                                onChange={(e) =>
                                    setNewClub({ ...newClub, isPublic: e.target.checked })
                                }
                            />
                            <span>Công khai</span>
                        </label>
                        <button
                            onClick={handleCreateClub}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            Tạo Club
                        </button>
                    </div>
                </div>
            )}

            {/* Danh sách clubs */}
            {clubs.length === 0 ? (
                <div className="text-center text-gray-400 p-6">
                    Community này chưa có club nào.
                </div>
            ) : (
                <div className="space-y-3">
                    {clubs.map((club) => (
                        <div
                            key={club.Id}
                            className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold text-white">{club.Name}</p>
                                {club.Description && (
                                    <p className="text-sm text-gray-400 mt-1">{club.Description}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm text-gray-300">
                                    <Users className="w-4 h-4 mr-2" />
                                    <span>{club.MembersCount} thành viên</span>
                                </div>

                                {/* ✅ Nút tham gia club */}
                                {!club.IsMember ? (
                                    <button
                                        onClick={() => handleJoinClub(club.Id)}
                                        className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Tham gia
                                    </button>
                                ) : (
                                    <span className="text-green-400 font-medium">Đã tham gia</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ClubList;
