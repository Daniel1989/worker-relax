import { request } from "../../utils/util";

//index.js
const app = getApp();

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    readyToCreateOrJoin: false,
  },

  onLoad: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e:any) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
      app.globalData.userInfo = e.detail.userInfo;
    }
    this.getOpenId();
  },

  getOpenId: function() {
    // 调用云函数
    wx.login({
      success: info => {
        request({
          path: '/login?js_code='+info.code,
          success: (res) => {
            app.globalData.openid = res.result.openid
            this.registerPlayer()
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err);
            wx.showToast({
              title: '登陆失败',
            });
          }
        })
      }
    })
    
  },

  registerPlayer: function() { 
    const _this = this;
    request({
      path: '/registerPlayer',
      method: 'POST',
      data: {
        userInfo: {
          openId: app.globalData.openid,
          ..._this.data.userInfo,
        }
      },
      complete: () => {
        wx.showToast({
          title: '登陆成功',
        });
        this.setData({
          readyToCreateOrJoin: true,
        });
      }
    })
  }
})