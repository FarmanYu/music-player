(function (exports) {
	function Aud(act, url) {
		this.act = act;
		this.url = url;

		this.src = act.createBufferSource();
		this.pNode = [];
	}
	Aud.prototype = {
		output : function () {
			for (var i = 0; i < this.pNode.length; i++) {
				var tNode = this.src;
				for (var j = 0; j < this.pNode[i].length; j++) {
					tNode.connect(this.pNode[i][j]);
					tNode = this.pNode[i][j];
				}
				tNode.connect(this.act.destination);
			}
		},
		play : function (loop) {
			this.src.loop = loop || false;
			this.output();
			this.src.start();
		},
		stop : function () {
			this.src.stop();
		},
		addNode : function (node, groupIdx) {
			groupIdx = groupIdx || 0;
			this.pNode[groupIdx] = this.pNode[groupIdx] || [];
			this.pNode[groupIdx].push(node);
		}
	};
	Aud.NODETYPE = {
		GNODE : 0
	}

	var AudManager = {
		urls : [],
		items : [],
		act : null,
		init : function () {
			try {
				this.act = new webkitAudioContext();
			} catch (e) {
				alert("不支持音频API!");
			}
		},
		load : function (callback) {
			for (var i = 0; i < this.urls.length; i++) {
				this.loadSingle(this.urls[i], callback);
			}
		},
		loadSingle : function (url, callback) {
			var req = new XMLHttpRequest();
			var self = this;
			req.open("GET", url, true);
			req.responseType = "arraybuffer";
			req.onload = function () {
				self.act.decodeAudioData(
					this.response,
					function (buf) {
					var aud = new Aud(self.act, url);
					aud.src.buffer = buf;
					self.items.push(aud);
					if (self.items.length == self.urls.length) {
						callback && callback();
					}
				},
					function () {
					alert("加载音频失败！");
				});
			}
			req.send();
		},
		createNode : function (nodeType, param) {
			var node = null;
			switch (nodeType) {
			case 1:
				node = this.act.createPanner();
				break;
			case 2:
				node = this.act.createJavaScriptNode(param[0], param[1], param[2]);
				break;
			defautl:
				node = this.act.createGainNode();
			}
			return node;
		}
	}
	exports.AudManager = AudManager;
})(this);