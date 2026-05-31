App({
  globalData: {
    statusBarHeight: 0,
    navBarHeight: 0,
    menuButtonTop: 0,
    menuButtonHeight: 0,
    token: null,
    userInfo: null,
    tier: 'visitor', // visitor | free | paid | founder
    shareData: null, // 动态分享数据（从 web-view postMessage 传来）
  },

  onLaunch() {
    this._calcNavBarHeight();
    this._restoreAuth();
  },

  /**
   * 计算自定义导航栏高度（适配胶囊按钮）
   * 移植自 zervi-test
   */
  _calcNavBarHeight() {
    try {
      const windowInfo = wx.getWindowInfo();
      const { statusBarHeight } = windowInfo;
      const { top, height } = wx.getMenuButtonBoundingClientRect();

      this.globalData.statusBarHeight = statusBarHeight;
      this.globalData.menuButtonTop = top;
      this.globalData.menuButtonHeight = height;
      // 导航栏高度 = 胶囊按钮到底部的间距 × 2 + 胶囊高度
      this.globalData.navBarHeight = (top - statusBarHeight) * 2 + height;
    } catch (e) {
      console.warn('[App] 导航栏高度计算失败，使用默认值', e);
      this.globalData.statusBarHeight = 20;
      this.globalData.navBarHeight = 44;
    }
  },

  /**
   * 恢复本地存储的认证状态
   */
  _restoreAuth() {
    const token = wx.getStorageSync('auth_token');
    const userInfo = wx.getStorageSync('user_info');
    const tier = wx.getStorageSync('user_tier');

    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
      this.globalData.tier = tier || 'free';
    }
  },

  /**
   * 判断用户是否已登录
   */
  isUserLoggedIn() {
    return !!this.globalData.token;
  },

  /**
   * 判断用户是否有治理权限（paid 及以上）
   */
  hasGovernanceAccess() {
    return ['paid', 'founder'].includes(this.globalData.tier);
  },

  /**
   * 登录成功后设置全局状态
   */
  setAuth({ token, userInfo, tier }) {
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.globalData.tier = tier || 'free';

    wx.setStorageSync('auth_token', token);
    wx.setStorageSync('user_info', userInfo);
    wx.setStorageSync('user_tier', tier || 'free');
  },

  /**
   * 退出登录
   */
  clearAuth() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.tier = 'visitor';

    wx.removeStorageSync('auth_token');
    wx.removeStorageSync('user_info');
    wx.removeStorageSync('user_tier');
  },

  /**
   * 更新分享数据（由 web-view postMessage 触发）
   */
  setShareData(data) {
    this.globalData.shareData = data;
  },
});
