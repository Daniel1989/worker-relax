import { request } from "../../utils/util";

// pages/room/waiting.ts
const app = getApp();
const { $Message } = require('../../dist/base/index');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myOpenId: app.globalData.openid,
    mySeat: null,
    myRole: "",
    room: {},
    seats: [],
    selectedPlayers: [],
    selectedGraveyard: [],
    status: "waiting",
    enableStart: false,
    isReady: false,
    currentRole: "",
    currentStep: "",
    simulated: [],
    actioned: false,
    showRight: false,
    // 女巫
    round: 0,
    lastSelected: null,
    // 狼人
    onlyWolf: false,
    // 结束
    voted: false,
    results: [],
    winner: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options:any) {
    if (!app.globalData.openid) {
      this.handleAlert("出错啦，重新登录一下吧", "error")
    }

    this.setData({
      myOpenId: app.globalData.openid
    });
    app.globalData.actioned = false;

    const _this = this;
    request({
      path: '/queryRoom?roomId=' + options.roomId,
      success: (res) => {
        _this.setData({ 
          room: res.data
        });
        this.calculateSeats(res.data.players, res.data.totalPlayer);
      }
    })
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

  toggleRight() {
    this.setData({
      showRight: !this.data.showRight
    });
  },

  handleAlert: function (content: string, type: string) {
    $Message({
      content: content,
      type: type
    });
  },

  calculateSeats: function(players:any, totalPlayers:any) {

    let rows = Math.ceil(totalPlayers / 3);
    let seats:any = new Array(rows);  
    for (let i = 0; i < seats.length; i++) {
      seats[i] = new Array(3);    
    }

    /**
     * 计算玩家位置
     */
    for (let i = 0; i < players.length; i++) {
      let seatNumber = players[i].seatNumber 
      if (players[i].openId == this.data.myOpenId) {
        this.setData({
          mySeat: players[i].seatNumber 
        });
      }
      seats[Math.floor(seatNumber / 3)][seatNumber % 3] = players[i]
    }

    /**
     * 初始化选择的玩家和底牌
     */
    let selectedPlayers:any = [], selectedGraveyard:any = [3]
    for (let i in totalPlayers) {
      selectedPlayers[i] = false
    }
    for (let i in selectedGraveyard) {
      selectedGraveyard[i] = false
    }

    /**
     * 更新数据
     */
    this.setData({
      seats: seats,
      selectedPlayers: selectedPlayers,
      selectedGraveyard: selectedGraveyard
    });

  },

})