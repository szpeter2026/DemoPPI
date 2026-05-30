/**
 * 共识算法核心逻辑（从 kung-fu 摘取）
 * 
 * 来源：kung-fu/web/app/api/consensus/[userId]/route.ts
 * 摘取日期：2026-05-31
 * 
 * 功能：计算两个用户之间的价值观共识度
 * 输入：两个用户的 Layer 0 JSONB 数据
 * 输出：0-100 的共识度分数 + 详细维度
 */

/**
 * 计算共识度
 * @param {Object} userA - 用户 A 的 Layer 0 数据
 * @param {Object} userB - 用户 B 的 Layer 0 数据
 * @returns {Object} 共识度结果
 */
function calculateConsensus(userA, userB) {
  // 维度权重（可调整）
  const weights = {
    values: 0.4,      // 核心价值观
    interests: 0.3,    // 兴趣标签
    experience: 0.2,    // 经验背景
    location: 0.1       // 地理位置
  };

  // 计算各维度匹配度
  const scores = {
    values: compareValues(userA.values, userB.values),
    interests: compareInterests(userA.interests, userB.interests),
    experience: compareExperience(userA.experience, userB.experience),
    location: compareLocation(userA.location, userB.location)
  };

  // 加权总分
  const totalScore = Object.keys(weights).reduce((sum, key) => {
    return sum + scores[key] * weights[key];
  }, 0);

  return {
    total: Math.round(totalScore * 100), // 转换为 0-100
    dimensions: scores,
    details: generateDetails(userA, userB, scores)
  };
}

/**
 * 比较核心价值观
 * 使用 Jaccard 相似度
 */
function compareValues(valuesA, valuesB) {
  if (!valuesA || !valuesB || valuesA.length === 0 || valuesB.length === 0) {
    return 0;
  }
  
  const setA = new Set(valuesA);
  const setB = new Set(valuesB);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

/**
 * 比较兴趣标签
 * 考虑权重（如果有的话）
 */
function compareInterests(interestsA, interestsB) {
  if (!interestsA || !interestsB || interestsA.length === 0 || interestsB.length === 0) {
    return 0;
  }
  
  // 简单匹配（可扩展为考虑权重的版本）
  const setA = new Set(interestsA.map(i => i.tag || i));
  const setB = new Set(interestsB.map(i => i.tag || i));
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

/**
 * 比较经验背景
 * 简单文本相似度（可升级为 embedding 相似度）
 */
function compareExperience(expA, expB) {
  if (!expA || !expB) {
    return 0;
  }
  
  // 简单关键词匹配（示例）
  const keywordsA = extractKeywords(expA);
  const keywordsB = extractKeywords(expB);
  
  if (keywordsA.length === 0 || keywordsB.length === 0) {
    return 0;
  }
  
  const setA = new Set(keywordsA);
  const setB = new Set(keywordsB);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  
  return intersection.size / Math.max(setA.size, setB.size);
}

/**
 * 比较地理位置
 * 相同城市 = 1, 相同国家 = 0.5, 不同 = 0
 */
function compareLocation(locA, locB) {
  if (!locA || !locB) {
    return 0;
  }
  
  if (locA.city === locB.city) {
    return 1;
  }
  
  if (locA.country === locB.country) {
    return 0.5;
  }
  
  return 0;
}

/**
 * 生成详细对比信息
 */
function generateDetails(userA, userB, scores) {
  return {
    sharedValues: userA.values?.filter(v => userB.values?.includes(v)) || [],
    sharedInterests: userA.interests?.filter(i => 
      userB.interests?.some(j => (i.tag || i) === (j.tag || j))
    ) || [],
    valueOverlap: scores.values,
    interestOverlap: scores.interests
  };
}

/**
 * 提取关键词（简单版）
 */
function extractKeywords(text) {
  // 简单实现：按空格分割，去停用词
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

// 导出
module.exports = {
  calculateConsensus,
  compareValues,
  compareInterests,
  compareExperience,
  compareLocation
};
