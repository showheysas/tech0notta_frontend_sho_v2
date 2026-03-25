import { Deal, DealCreate, DealUpdate, DealStatus } from '../types/deal';
import { fetchWithAuth } from './client';

export async function getDeals(customerId?: string, status?: DealStatus): Promise<Deal[]> {
  const params = new URLSearchParams();
  if (customerId) params.set('customer_id', customerId);
  if (status) params.set('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetchWithAuth(`/api/deals${query}`);
  if (!res.ok) throw new Error('商談一覧の取得に失敗しました');
  return res.json();
}

export async function getDeal(dealId: string): Promise<Deal> {
  const res = await fetchWithAuth(`/api/deals/${dealId}`);
  if (!res.ok) throw new Error('商談情報の取得に失敗しました');
  return res.json();
}

export async function createDeal(data: DealCreate): Promise<Deal> {
  const res = await fetchWithAuth('/api/deals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('商談の作成に失敗しました');
  return res.json();
}

export async function updateDeal(dealId: string, data: DealUpdate): Promise<Deal> {
  const res = await fetchWithAuth(`/api/deals/${dealId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('商談の更新に失敗しました');
  return res.json();
}

export async function deleteDeal(dealId: string): Promise<void> {
  const res = await fetchWithAuth(`/api/deals/${dealId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('商談の削除に失敗しました');
}
