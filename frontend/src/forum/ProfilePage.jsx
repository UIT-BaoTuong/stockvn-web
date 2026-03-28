import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AtSign, CalendarDays, Hand, Mail, PenSquare, User } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authClient, forumClient, resolveAuthAssetUrl } from '../api';
import ForumLayout from './ForumLayout';
import { useAuthProfile } from './useAuthProfile';

const parseErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const formatRegisteredDate = (value) => {
  if (!value) {
    return 'Không có';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Không có';
  }

  return parsed.toLocaleString('vi-VN');
};

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profileQuery = useAuthProfile();
  const fileInputRef = useRef(null);

  const userStatsQuery = useQuery({
    queryKey: ['user-stats', profileQuery.data?.username],
    enabled: Boolean(profileQuery.data?.username),
    queryFn: async () => {
      const response = await forumClient.getUserStats(profileQuery.data.username);
      return response.data;
    },
  });

  const clearAvatarMutation = useMutation({
    mutationFn: () => authClient.updateAvatar({ avatarUrl: '' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Đã xóa ảnh đại diện');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không thể xóa ảnh đại diện'));
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file) => authClient.uploadAvatar(file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Đã tải ảnh đại diện lên');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không thể tải ảnh đại diện'));
    },
  });

  if (profileQuery.isLoading) {
    return (
      <div className="loading-screen">
        <div className="skeleton skeleton-banner"></div>
        <div className="skeleton-col"></div>
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <ForumLayout rightStats={{ left: 0, right: 0 }}>
      {() => (
        <section className="panel page-panel">
          <div className="page-toolbar">
            <button className="ghost-btn" onClick={() => navigate('/forum/categories')}>
              <ArrowLeft size={14} /> Quay lại
            </button>
          </div>

          <div className="panel-head">
            <User size={16} />
            <h2>Thông tin cá nhân</h2>
          </div>

          <motion.div
            className="profile-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="profile-hero">
              <div className="profile-avatar">
                {profile?.avatarUrl ? (
                  <button
                    type="button"
                    className="avatar-upload-trigger"
                    title="Chạm để đổi ảnh đại diện"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAvatarMutation.isPending}
                  >
                    <img src={resolveAuthAssetUrl(profile.avatarUrl)} alt="Avatar" className="profile-avatar-image" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="avatar-upload-trigger"
                    title="Chạm để đổi ảnh đại diện"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAvatarMutation.isPending}
                  >
                    {(profile?.username || 'User').charAt(0).toUpperCase()}
                  </button>
                )}
              </div>
              <div>
                <h3 className="profile-name">{profile?.username || 'Không có tên'}</h3>
                <p className="profile-caption">Tài khoản thành viên Stock Forum</p>
                <p className="profile-caption">Bấm vào avatar để tải ảnh từ máy tính hoặc điện thoại</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden-file-input"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (!selectedFile) {
                  return;
                }

                uploadAvatarMutation.mutate(selectedFile);
                e.target.value = '';
              }}
            />

            <div className="stack-form profile-avatar-form">
              <div className="profile-info-label">Bạn có thể bấm trực tiếp vào avatar để đổi ảnh từ thiết bị</div>
              <div className="profile-avatar-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending || clearAvatarMutation.isPending}
                >
                  Chọn ảnh từ thiết bị
                </button>
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    clearAvatarMutation.mutate();
                  }}
                  disabled={uploadAvatarMutation.isPending || clearAvatarMutation.isPending || !profile?.avatarUrl}
                >
                  Xóa ảnh
                </button>
              </div>
            </div>

            <div className="profile-grid">
              <div className="profile-info-card">
                <div className="profile-info-label"><AtSign size={14} /> Tên tài khoản</div>
                <div className="profile-info-value">{profile?.username || 'Không có'}</div>
              </div>

              <div className="profile-info-card">
                <div className="profile-info-label"><Mail size={14} /> Email</div>
                <div className="profile-info-value">{profile?.email || 'Không có'}</div>
              </div>

              <div className="profile-info-card">
                <div className="profile-info-label"><CalendarDays size={14} /> Ngày đăng ký</div>
                <div className="profile-info-value">{formatRegisteredDate(profile?.registeredAt)}</div>
              </div>

              <div className="profile-info-card">
                <div className="profile-info-label"><Hand size={14} /> Số lượng react</div>
                <div className="profile-info-value">{userStatsQuery.data?.reactionCount ?? 0}</div>
              </div>

              <div className="profile-info-card">
                <div className="profile-info-label"><PenSquare size={14} /> Số bài viết</div>
                <div className="profile-info-value">{userStatsQuery.data?.postCount ?? 0}</div>
              </div>
            </div>

            <div className="profile-info">
              <p className="profile-note">Bạn có thể quay lại forum để tiếp tục tạo thread hoặc tham gia bình luận.</p>
              <button className="ghost-btn" onClick={() => navigate('/forum/categories')}>
                Quay về forum
              </button>
            </div>
          </motion.div>
        </section>
      )}
    </ForumLayout>
  );
}

export default ProfilePage;
