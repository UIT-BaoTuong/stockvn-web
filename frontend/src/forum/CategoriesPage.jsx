import { motion } from 'framer-motion';
import { BarChart3, Flame, MoonStar, Search } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { forumClient } from '../api';
import ForumLayout from './ForumLayout';

const parseErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;
const hotScore = (category) => (category?.threadCount || 0) * 5 + (category?.viewCount || 0);

function CategoriesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await forumClient.getCategories();
      return response.data || [];
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: ({ payload, userName }) => forumClient.createCategory(payload, userName),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategoryName('');
      toast.success('Đã tạo category mới');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không tạo được category'));
    },
  });

  const categories = categoriesQuery.data || [];
  const normalizedKeyword = searchKeyword.trim().toLowerCase();

  const hotCategoryIds = useMemo(() => {
    const sortedByHot = [...categories]
      .filter((category) => category?.name?.toUpperCase() !== 'ALL')
      .sort((a, b) => hotScore(b) - hotScore(a));

    return new Set(
      sortedByHot
        .filter((category) => hotScore(category) > 0)
        .slice(0, 10)
        .map((category) => category.id),
    );
  }, [categories]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => {
      const aHot = hotCategoryIds.has(a.id) ? 1 : 0;
      const bHot = hotCategoryIds.has(b.id) ? 1 : 0;
      if (aHot !== bHot) {
        return bHot - aHot;
      }
      const scoreDiff = hotScore(b) - hotScore(a);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return (a?.name || '').localeCompare(b?.name || '');
    }),
    [categories, hotCategoryIds],
  );

  const filteredCategories = !normalizedKeyword
    ? sortedCategories
    : sortedCategories.filter((category) =>
      category?.name?.toLowerCase().includes(normalizedKeyword),
    );

  return (
    <ForumLayout rightStats={{ left: categories.length, right: 0 }}>
      {(forumUserName) => (
        <section className="panel page-panel">
          <div className="panel-head"><BarChart3 size={16} /><h2>Stock Categories</h2></div>

          {forumUserName?.toLowerCase() === 'admin' && (
            <form
              className="stack-form"
              onSubmit={(e) => {
                e.preventDefault();
                createCategoryMutation.mutate({
                  payload: {
                    name: newCategoryName.trim(),
                  },
                  userName: forumUserName,
                });
              }}
            >
              <input placeholder="Ticker: FPT, VNM..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
              <button type="submit" className="primary-btn" disabled={createCategoryMutation.isPending}>Tạo category</button>
            </form>
          )}

          {categoriesQuery.isError && <p className="empty-state">Không tải được category.</p>}
          {!categories.length && !categoriesQuery.isError && (
            <div className="empty-state-card">
              <MoonStar size={16} />
              <p>Chưa có category. Tạo mã đầu tiên để mở forum.</p>
            </div>
          )}

          <div className="search-category-box">
            <Search size={15} />
            <input
              className="search-category-input"
              placeholder="Tìm stock..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              disabled={!categories.length}
            />
          </div>

          {!!categories.length && !filteredCategories.length && (
            <p className="empty-state">Không tìm thấy category phù hợp.</p>
          )}

          <ul className="list">
            {filteredCategories.map((category) => (
              <li key={category.id}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="list-item"
                  onClick={() => navigate(`/forum/categories/${category.id}/threads`)}
                >
                  <div className="list-title-row">
                    {hotCategoryIds.has(category.id) && (
                      <div style={{ width: '18px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px' }}>
                        <motion.div
                          animate={{ scale: [1, 1.1, 0.95, 1.05, 1], rotate: [0, -5, 5, -3, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                        >
                          <Flame size={14} style={{ color: '#e65100' }} />
                        </motion.div>
                      </div>
                    )}
                    <span className="list-title">{category.name}</span>
                  </div>
                  <div className="list-subtitle">
                    <span>{category.threadCount || 0} threads</span>
                    <span style={{ margin: '0 8px', color: '#999' }}>•</span>
                    <span>{category.viewCount || 0} views</span>
                  </div>
                </motion.button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ForumLayout>
  );
}

export default CategoriesPage;
