import { request } from "../../utils/util";

// pages/setup/create.ts
const app = getApp();
const { $Message } = require('../../dist/base/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    totalPlayer: 4,
    wereWolf: 0,
    alphaWolf: 0,
    minion: 0,
    mysticWolf: 0,
    seer: 0,
    apprenticeSeer: 0,
    witch: 0,
    revealer: 0,
    robber: 0,
    troublemaker: 0,
    insomniac: 0,
    drunk: 0,
    mason: 0,
    tanner: 0,
    villager: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  handleInputChange: function (e: any) {
    this.setData({
      totalPlayer: e.detail.detail.value
    })
  },

  handleChangeWereWolf: function (e:any) {
    this.setData({
      wereWolf: e.detail.value
    })
  },

  handleChangeAlphaWolf: function (e:any) {
    this.setData({
      alphaWolf: e.detail.value
    })
  },

  handleChangeMinion: function (e:any) {
    this.setData({
      minion: e.detail.value
    })
  },

  handleChangeMysticWolf: function (e:any) {
    this.setData({
      mysticWolf: e.detail.value
    })
  },

  handleChangeSeer: function (e:any) {
    this.setData({
      seer: e.detail.value
    })
  },

  handleChangeApprenticeSeer: function (e:any) {
    this.setData({
      apprenticeSeer: e.detail.value
    })
  },

  handleChangeWitch: function (e:any) {
    this.setData({
      witch: e.detail.value
    })
  },

  handleChangeRevealer: function (e:any) {
    this.setData({
      revealer: e.detail.value
    })
  },

  handleChangeRobber: function (e:any) {
    this.setData({
      robber: e.detail.value
    })
  },

  handleChangeTroublemaker: function (e:any) {
    this.setData({
      troublemaker: e.detail.value
    })
  },

  handleChangeInsomniac: function (e:any) {
    this.setData({
      insomniac: e.detail.value
    })
  },

  handleChangeDrunk: function (e:any) {
    this.setData({
      drunk: e.detail.value
    })
  },

  handleChangeMason: function (e:any) {
    this.setData({
      mason: e.detail.value
    })
  },

  handleChangeTanner: function (e:any) {
    this.setData({
      tanner: e.detail.value
    })
  },

  handleChangeVillager: function (e:any) {
    this.setData({
      villager: e.detail.value
    })
  },

  handleAlert: function(content: any, type:any) {
    $Message({
      content: content,
      type: type
    });
  },

  calculateTotalRoles: function() {
    const {wereWolf, alphaWolf, minion, mysticWolf, seer, 
    apprenticeSeer, witch, revealer, robber, troublemaker, insomniac, drunk, mason, tanner, villager} = this.data;
    return wereWolf + alphaWolf + minion + mysticWolf + seer + 
      apprenticeSeer + witch + revealer + robber + troublemaker + insomniac + 
      drunk + mason + tanner + villager;
  },

  calculateWolfRoles: function() {
    const { wereWolf, alphaWolf, mysticWolf} = this.data;
    return wereWolf + alphaWolf + mysticWolf;
  },

  onCreateRoom: function() {
    var totalPlayers = this.data.totalPlayer;
    if (isNaN(totalPlayers) || totalPlayers < 2 || totalPlayers >= 20) {
      this.handleAlert("请输入合法房间人数（数字2到20）", 'warning')
      return;
    }

    var totalRolesCount = this.calculateTotalRoles()
    var totalWolfRolesCount = this.calculateWolfRoles()

    if (totalWolfRolesCount == 0) {
      this.handleAlert("请从普通狼人，头狼和狼先知中选择至少一个角色", 'warning')
      return
    }

    const needRoles = totalPlayers + 3
    if (totalRolesCount != needRoles) {
      this.handleAlert("已选角色 " + totalRolesCount + ", 需要角色" + needRoles, 'warning')
      return
    }

    const { totalPlayer, wereWolf, alphaWolf, minion, mysticWolf, seer, apprenticeSeer, witch, revealer, robber, troublemaker, insomniac, drunk, mason, tanner, villager } = this.data;
    console.log("bb")
    request({
      path: '/createRoom',
      method: 'POST',
      data: {
        totalPlayer,
        totalRoles: { wereWolf, alphaWolf, minion, mysticWolf, seer, apprenticeSeer, witch, revealer, robber, troublemaker, insomniac, drunk, mason, tanner, villager },
        userInfo: {
          openId: app.globalData.openid
        },
        richUserInfo: app.globalData.userInfo,
      },
      success: (res:any) => {
        const { success, message, roomId } = res
        if (!success) {
          this.handleAlert(message, 'warning')
          return
        }
        wx.redirectTo({
          url: '../room/waiting?roomId=' + roomId,
        });
      }
    })
  }
})