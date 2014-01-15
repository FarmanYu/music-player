(function (exports) {
	var supportFormat = /(.mp3|.ogg|.wma|.ape)$/;
	var pageController = {};
	pageController.selFlie = function () {
		var fs = $("#selFile")[0].files;
		if (fs.length > 0) {
			$("#fList").empty();
			Player.clearList();
			var idxs = 0;

			for (var i = 0; i < fs.length; i++) {
				var file = fs[i];
				if (file.name.match(supportFormat)) {
					var li = $("<li id='" + (idxs++) + "'>" + file.name.replace(supportFormat, "") + "</li>");

					li.bind("dblclick", function () {
						pageController.play($(this).attr("id"));
					});

					var fURL = Util.createURL(file);
					Player.add(file.name, fURL);

					$("#fList").append(li);
				}
			}

			if (!Player.isEmptyPlayList()) {
				Player.currentId = 0;
			}
		}
	}

	pageController.setMusicCurrent = function (song) {
		if (song != null) {
			var songName = song.name.replace(supportFormat, "");
			$("#title").text(songName);
			$("#play").css("background", "-webkit-canvas(stop)");
			document.title = "正在播放：" + songName;
			$("#fList li").removeClass("current");
			$("#fList li[id=" + Player.currentId + "]").addClass("current");
            
		}
	}

	pageController.stop = function () {
		Player.stop();
		$("#play").css("background", "-webkit-canvas(play)");
		document.title = "音乐暂停";
	}

	pageController.setCurrentTime = function (cTime, tTime) {
		var per = (tTime <= 0) ? 0 : cTime / tTime;
		var pPos = $("#progress").width() * per;
		$("#pBar").css("left", pPos);
		$("#pgBar").width(pPos);
	}
    
    pageController.setSongTime = function ( songTime ) {
		if(songTime !== pageController.songTime){
            pageController.songTime = songTime;
            $("#time").text(Util.FormatTime(songTime));
        }
	}
    
    pageController.setVolume = function ( volume ) {
		if(Player && Player.audioObj){
           Player.audioObj.volume = Util.FormatFloat(volume / 100);
        }
	}
    
	pageController.checkMusic = function () {
		if (Player.isEmptyPlayList()) {
			msg.show("请添加歌曲！");
			return false;
		}
		return true;
	}
    
	pageController.bindPlayError = function () {
		var audio = $(Player.audioObj);
		var errMsg = ["数据读取失败", "网络故障", "解码失败", "不支持的格式！"];

		audio.bind("error", function (e) {
			msg.show(errMsg[this.error.code - 1]);
		});

	}

	pageController.bindProgress = function () {
		var audio = $(Player.audioObj);

		$(document).bind("mousedown", function(e){
            e = e || window.event;
			var srcEle = e.srcElement || e.target;
			e.preventDefault();
			if (srcEle && srcEle.id == "pBar") {
                
				var x = e.pageX;
				var px = $("#pBar").position().left;
				var pWidth = $("#progress").width();
				$(document).bind("mousemove", function(e){
					if (!audio[0].paused) {
                        e = e || window.event;
						e.preventDefault();

						var xOff = e.pageX - x;
						var nx = (px + xOff);
						nx = (nx <= 0) ? 0 : nx;
						nx = (nx > pWidth) ? pWidth : nx;

						$("#pBar").css("left", nx);

						audio[0].currentTime = audio[0].duration * (nx / pWidth);
					}
				});
				$(document).bind("mouseup", function (e) {
					$(document).unbind("mousemove");
				});
			}
		});
        
        var self = this;
		audio.bind("timeupdate", function () {
			var currentTime = this.currentTime,
			tTime = this.duration;
			self.setCurrentTime(currentTime, tTime);
            pageController.setSongTime(tTime);
		});
        
        //自动播放下一首
        audio.bind("ended", function () {
			var song = Player.playNext();
			self.setMusicCurrent(song);
		});
	}
	pageController.play = function (index) {
		var song = Player.play(index);
		this.setMusicCurrent(song);
	}
    
	pageController.bindPlayer = function () {
		Player.init();
        var self = this;
		$("#play").click(function () {
			if (!self.checkMusic())return;
			if (Player.audioObj.paused) {
				self.play(Player.currentId);
			} else {
				self.stop();
			}
		});
		$("#next").click(function () {
			if (!self.checkMusic())return;
			var song = Player.playNext();
			self.setMusicCurrent(song);
		});

		$("#pri").click(function () {
			if (!self.checkMusic())return;
			var song = Player.playPri();
			self.setMusicCurrent(song);
		});
	}
    pageController.bindVolume = function(){
        $("#vol").click(function(e){
            var oX = e.offsetX;
            $("#pVol").css("width", oX);
            pageController.setVolume(oX);
        });
    }
    
	exports.pager = {
		init : function () {
			$("#selFile").bind("change", pageController.selFlie);
			$("#addFloder").bind("click", function () {
				$("#selFile").click();
			});
			pageController.bindPlayer();
			pageController.bindPlayError();
			pageController.bindProgress();
            pageController.bindVolume();
		}
	};
})(this);
