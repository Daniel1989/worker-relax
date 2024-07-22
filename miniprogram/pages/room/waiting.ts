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

  onSetReady: function() {
    request({
      path: 'setReady',
      data: { 
        roomId: (this.data.room as any)._id,
        userInfo: app.globalData.userInfo
      },
      success: () => {
        this.setData({
          isReady: true
        });
      }
    })
  },

  onStart: function() {
    request({
      path: 'startGame',
      data: { 
        roomId: (this.data.room as any)._id,
        userInfo: app.globalData.userInfo
      },
      success: () => {
        console.log("game start")
      }
    })
  },

  /**
   * 操作提示
   */
  setHint: function(game:any) {
    let players = game.roleAssignment.playerRoles;
    switch (this.data.currentRole) {
      case "wereWolf": 
        var wolf = "";
        for (var i = 0; i < players.length; i++) {
          if (i != this.data.mySeat && (players[i].init == "wereWolf" || players[i].init == "alphaWolf" || players[i].init == "mysticWolf")) {
            wolf += i + "号 ";
          }
        }
        if (wolf == "") {
          this.setData({
            onlyWolf: true
          })
          this.updateStep("狼人只有你自己，你可以选择查看一张底牌");
        } else {
          this.updateStep("你的狼同伴是: " + wolf);
        }
        break;
      case "minion": 
        var wolf = "";
        for (var i = 0; i < players.length; i++) {
          if (players[i].init == "wereWolf" || players[i].init == "alphaWolf" || players[i].init == "mysticWolf") {
            wolf += i + "号 ";
          }
        }
        if (wolf == "") {
          this.updateStep("场上没有狼人");
        } else {
          this.updateStep("狼人是: " + wolf);
        }
        break;
      case "alphaWolf": 
        this.updateStep("请选择一名玩家将他变成狼人");
        break;
      case "seer":
      case "mysticWolf":
        this.updateStep("请选择一名玩家查看它的身份");
        break;
      case "apprenticeSeer": 
        this.updateStep("请选择查看一张底牌");
        break;
      case "witch": 
        this.updateStep("请选择查看一张底牌并和任意一名玩家的卡牌交换");
        break;
      case "revealer": 
        this.updateStep("请翻开任意一名玩家的卡牌");
        break;
      case "robber": 
        this.updateStep("请选择查看任意一名玩家的卡牌并盗用他的身份");
        break;
      case "troublemaker": 
        this.updateStep("请选择任意两名玩家的卡牌并交换");
        break;
      case "insomniac": 
        this.updateStep("你的身份是: " + players[this.data.mySeat!].current);
        break;
      case "drunk": 
        this.updateStep("请选择一张底牌并盗用此身份");
        break;
      case "mason": 
        var mason = ""
        for (var i = 0; i < players.length; i++) {
          if (i != this.data.mySeat && players[i].init == "mason") {
            mason += i + "号 ";
          }
        }
        if (mason == "") {
          this.updateStep("守夜人只有你自己");
        } else {
          this.updateStep("另外的守夜人是: " + mason);
        }
        break;
    }
  },

  updateStep: function(step:any) {
    this.setData({
      currentStep: step
    });
  },

  /**
   * 操作卡牌
   */
  onSelect: function(e:any) {

    let selectedPlayers:any = this.data.selectedPlayers
    let selectedGraveyard:any = this.data.selectedGraveyard
    let index = e.currentTarget.dataset.index

    if (index >= (this.data.room as any).totalPlayer) {
      return
    }
    if (index >= 0) {
      selectedPlayers[e.currentTarget.dataset.index] = !selectedPlayers[e.currentTarget.dataset.index]
    } else {
      selectedGraveyard[-1 * e.currentTarget.dataset.index - 1] = !selectedGraveyard[-1 * e.currentTarget.dataset.index - 1]
    }

    this.setData({
      selectedPlayers: selectedPlayers,
      selectedGraveyard: selectedGraveyard
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

  onAction: function() {
    
    let game = (this.data.room as any).game
    var selectedPlayers = []
    var selectedGraveyard = []
    for (var i = 0; i < this.data.selectedPlayers.length; i++) {
      if (this.data.selectedPlayers[i]) {
        selectedPlayers.push(i)
      }
    }
    for (var i = 0; i < 3; i++) {
      if (this.data.selectedGraveyard[i]) {
        selectedGraveyard.push(i)
      }
    }

    switch(game.currentRole) {

      // 狼人 || 爪牙 || 失眠者 || 守夜人
      // 夜晚除了看牌外无(选牌)操作
      case "wereWolf":
      case "minion":
      case "insomniac":
      case "mason": 

        // 如果是独狼可以查看一张底牌
        if (this.data.onlyWolf && (this.data.myRole == "wereWolf" || this.data.myRole == "alphaWolf" || this.data.myRole == "mysticWolf")) {
          // 玩家
          if (selectedPlayers.length > 0 || selectedGraveyard.length != 1) {
            this.handleAlert("请（只）选择一张底牌哦", 'warning')
            return;
          } else {
            this.updateStep("这张底牌的身份是: " + this.convertFull(game.roleAssignment.graveyardRoles[selectedGraveyard[0]].current))
          }
        } else {
          if (selectedPlayers.length > 0 || selectedGraveyard.length > 0)        {
            this.handleAlert("请不要选择玩家或者底牌哦", 'warning')
            return;
          }
        }
        break;
      
      // 头狼
      // 指定一名玩家成为狼人
      case "alphaWolf": 
        if (selectedPlayers.length != 1 || selectedGraveyard.length > 0) {
          this.handleAlert("请（只）选择一名玩家哦", 'warning')
          return;
        } else {
          game.roleAssignment.playerRoles[selectedPlayers[0]].current = "wereWolf"
        }
        break;
      
      // 预言家 || 狼预言家
      // 查看场上一名玩家身份
      case "mysticWolf":
      case "seer": 
        if (selectedPlayers.length != 1 || selectedGraveyard.length > 0) {
            this.handleAlert("请（只）选择一名玩家哦", 'warning')
            return;
        } else if (selectedPlayers[0] == this.data.mySeat) {
            this.handleAlert("请不要选择自己哦", 'warning')
            return;
        } else {
            this.updateStep("这名玩家的身份是: " + this.convertFull(game.roleAssignment.playerRoles[selectedPlayers[0]].current))
        }
        break;
      
      // 学徒预言家
      // 查看一张底牌
      case "apprenticeSeer": 
        if (selectedPlayers.length > 0 || selectedGraveyard.length != 1) {
          this.handleAlert("请（只）选择一张底牌哦", 'warning')
          return;
        } else {
          this.updateStep("这张底牌的身份是: " + this.convertFull(game.roleAssignment.graveyardRoles[selectedGraveyard[0]].current))
        }
        break;
      // 女巫
      // Round0: 查看一张底牌 & Round1: 将这张牌与任意一名玩家的卡牌交换
      case "witch": 
        if (this.data.round == 0) {
          if (selectedPlayers.length > 0 || selectedGraveyard.length != 1) {
            this.handleAlert("请（只）选择一张底牌哦", 'warning')
            return;
          } else {
            this.updateStep("这张底牌的身份是: " + this.convertFull(game.roleAssignment.graveyardRoles[selectedGraveyard[0]].current) + ", 再选择一名玩家把这个身份给他吧")
            this.setData({
              lastSelected: selectedGraveyard[0] as any
            });
          }
        }
        if (this.data.round == 1) {
          if (selectedPlayers.length != 1) {
            this.handleAlert("请（只）选择一名玩家哦", 'warning')
            return;
          } else {
            var playerRole = game.roleAssignment.playerRoles[selectedPlayers[0]].current
            game.roleAssignment.playerRoles[selectedPlayers[0]].current = game.roleAssignment.graveyardRoles[this.data.lastSelected!].current
            game.roleAssignment.graveyardRoles[this.data.lastSelected!].current = playerRole
          }
        }
        var currentRound = parseInt(this.data.round as any) + 1
        this.setData({
          round: currentRound
        });
        break;
      // 揭示者
      case "revealer": 
        if (selectedPlayers.length != 1 || selectedGraveyard.length > 0) {
          this.handleAlert("请（只）选择一名玩家哦", 'warning')
          return;
        } else if (selectedPlayers[0] == this.data.mySeat) {
          this.handleAlert("请不要选择自己哦", 'warning')
          return;
        } else {
          var thisRole = game.roleAssignment.playerRoles[selectedPlayers[0]].current
          if (thisRole == "wereWolf" || thisRole == "alphaWolf" || thisRole == "mysticWolf") {
            this.updateStep(selectedPlayers[0] + "号的身份是: " + this.convertFull(thisRole) + ", 由于这名玩家是狼人，其他人将看不到他的身份")
          } else {
            this.updateStep(selectedPlayers[0] + "号的身份是: " + this.convertFull(thisRole) + ", 其他人醒来后将能够看到他的身份")
            // 数据库里说明翻牌座位号和角色
            game.revealer = {
              seatNumber: selectedPlayers[0],
              role: thisRole
            }
          }
        }
        break;
      // 强盗
      // 查看场上一名玩家身份并将自己的卡牌与他交换
      case "robber": 
        if (selectedPlayers.length != 1 || selectedGraveyard.length > 0) {
          this.handleAlert("请（只）选择一名玩家哦", 'warning')
          return;
        } else {
          this.updateStep("这名玩家(你现在)的身份是: " + game.roleAssignment.playerRoles[selectedPlayers[0]].current)
          var playerRole = game.roleAssignment.playerRoles[selectedPlayers[0]].current
          game.roleAssignment.playerRoles[selectedPlayers[0]].current = game.roleAssignment.playerRoles[this.data.mySeat!].current
          game.roleAssignment.playerRoles[this.data.mySeat!].current = playerRole
        }
        break;
      // 捣蛋鬼
      // 交换任意两名玩家的卡牌
      case "troublemaker": 
        if (selectedPlayers.length != 2 || selectedGraveyard.length > 0) {
          this.handleAlert("请（只）选择二名玩家哦", 'warning')
          return;
        } else {
          var playerRole = game.roleAssignment.playerRoles[selectedPlayers[0]].current
          game.roleAssignment.playerRoles[selectedPlayers[0]].current = game.roleAssignment.playerRoles[selectedPlayers[1]].current
          game.roleAssignment.playerRoles[selectedPlayers[1]].current = playerRole
        }
        break;
      // 酒鬼
      // 将自己的卡牌和底牌中的一张交换
      case "drunk": 
        if (selectedPlayers.length > 0 || selectedGraveyard.length != 1) {
          this.handleAlert("请（只）选择一张底牌", 'warning')
          return;
        } else {
          var graveyardRole = game.roleAssignment.graveyardRoles[selectedGraveyard[0]].current
          game.roleAssignment.graveyardRoles[selectedGraveyard[0]].current = game.roleAssignment.playerRoles[this.data.mySeat!].current
          game.roleAssignment.playerRoles[this.data.mySeat!].current = graveyardRole
        }
        break;
    }

    if (this.data.myRole == "witch" && this.data.round == 1) {
      return;
    } else {
      this.setData({
        actioned: true
      });
      app.globalData.actioned = true;
      this.updateDatabase(game, this.data.myRole, 2000);
    }

  },

  /**
   * 模拟动作 （角色在墓地里）
   */
  simulateAction: function(game:any) {

    // 如果已经模拟过则返回
    for (var i = 0; i < this.data.simulated.length; i++) {
      if (this.data.currentRole == this.data.simulated[i]) {
        return
      }
    }

    let simulated:any = this.data.simulated
    simulated.push(this.data.currentRole)
    this.setData({
      simulated: simulated,
    })

    const time = game.inGraveyardNextActionRole.pendingTime
    this.updateDatabase(game, this.data.currentRole, time)
  },

  updateDatabase: function(game:any, role:any, time:any) {
    // TODO 0706, 这里要根据行动，更新数据库
    this.delay(time).then(
      (_) => {
        var _this = this
        request({
          path: '/takeAction',
          data: {
            roomId: _this.data.room._id,
            game: game,
            myRole: role,
            userInfo: app.globalData.userInfo
          },
          success: (res) => {
            console.log(res)
          }
        })
      }
    )
  },

  delay: function(milSec: number) {
    return new Promise(resolve => {
      setTimeout(resolve, milSec)
    })
  },

  convertFull: function(value: any) {
    switch (value) {
      case "wereWolf": {
        return "狼人[" + value + "]";
      }
      case "minion": {
        return "替罪羊[" + value + "]";
      }
      case "alphaWolf": {
        return "头狼[" + value + "]";
      }
      case "mysticWolf": {
        return "狼预言家[" + value + "]";
      }
      case "seer": {
        return "预言家[" + value + "]";
      }
      case "apprenticeSeer": {
        return "学徒预言家[" + value + "]";
      }
      case "witch": {
        return "女巫[" + value + "]";
      }
      case "revealer": {
        return "揭示者[" + value + "]";
      }
      case "robber": {
        return "强盗[" + value + "]";
      }
      case "troublemaker": {
        return "捣蛋鬼[" + value + "]";
      }
      case "insomniac": {
        return "失眠者[" + value + "]";
      }
      case "drunk": {
        return "酒鬼[" + value + "]";
      }
      case "mason": {
        return "守夜人[" + value + "]";
      }
      case "tanner": {
        return "皮匠[" + value + "]";
      }
      case "villager": {
        return "村民[" + value + "]";
      }
    }
  }
})