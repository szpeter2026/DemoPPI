/**
 * 邀请码工具函数（从 Iamgeek 移植思路）
 * 
 * 来源：Iamgeek/invite_service.py（Python）→ JavaScript 移植
 * 摘取日期：2026-05-31
 * 
 * 功能：邀请码生成、校验、消耗
 * 数据表：Supabase `invites` 表
 */

const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客户端（实际使用时从环境变量读取）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * 生成邀请码
 * @param {string} issuerId - 邀请人用户 ID
 * @param {number} quota - 邀请配额（默认 5）
 * @param {number} expiresInDays - 过期天数（默认 30 天）
 * @returns {Promise<Object>} 邀请码记录
 */
async function generateInviteCode(issuerId, quota = 5, expiresInDays = 30) {
  // 生成随机码（8 位字母数字）
  const code = generateRandomCode(8);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  const { data, error } = await supabase
    .from('invites')
    .insert({
      code: code,
      issuer_id: issuerId,
      quota: quota,
      used_count: 0,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`生成邀请码失败: ${error.message}`);
  }
  
  return data;
}

/**
 * 校验邀请码
 * @param {string} code - 邀请码
 * @returns {Promise<Object>} 校验结果
 */
async function validateInviteCode(code) {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error || !data) {
    return { valid: false, reason: '邀请码不存在' };
  }
  
  // 检查是否已用完
  if (data.used_count >= data.quota) {
    return { valid: false, reason: '邀请码已用完' };
  }
  
  // 检查是否过期
  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, reason: '邀请码已过期' };
  }
  
  return { valid: true, invite: data };
}

/**
 * 消耗邀请码（注册成功后调用）
 * @param {string} code - 邀请码
 * @param {string} usedBy - 注册用户 ID
 * @returns {Promise<void>}
 */
async function consumeInviteCode(code, usedBy) {
  // 先校验
  const validation = await validateInviteCode(code);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }
  
  // 更新 used_count 和 used_by
  const { error } = await supabase
    .from('invites')
    .update({
      used_count: validation.invite.used_count + 1,
      used_by: validation.invite.used_by 
        ? [...validation.invite.used_by, usedBy]
        : [usedBy]
    })
    .eq('code', code);
  
  if (error) {
    throw new Error(`消耗邀请码失败: ${error.message}`);
  }
}

/**
 * 获取用户的邀请码列表
 * @param {string} userId - 用户 ID
 * @returns {Promise<Array>} 邀请码列表
 */
async function getUserInvites(userId) {
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('issuer_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`获取邀请码失败: ${error.message}`);
  }
  
  return data;
}

/**
 * 生成随机邀请码
 * @param {number} length - 码长度
 * @returns {string} 随机码
 */
function generateRandomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 注册时校验邀请码（API 端点）
 * GET /api/invites/validate?code=XXX
 */
async function handleValidateRequest(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: '缺少邀请码' });
  }
  
  const validation = await validateInviteCode(code);
  
  if (!validation.valid) {
    return res.status(400).json({ valid: false, reason: validation.reason });
  }
  
  return res.status(200).json({
    valid: true,
    invite: {
      code: validation.invite.code,
      issuer_id: validation.invite.issuer_id,
      remaining: validation.invite.quota - validation.invite.used_count
    }
  });
}

module.exports = {
  generateInviteCode,
  validateInviteCode,
  consumeInviteCode,
  getUserInvites,
  handleValidateRequest
};
