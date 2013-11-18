(function() {
	var Remote = ripple.Remote;
	var Amount = ripple.Amount;
	var optionsRemote = {
	  trusted:        true,
	  servers: [
		{
			host:    's1.ripple.com',
			port:    443,
			secure:  true
		}
	  ]
	}

	var optionsFeed = {
			currencies:    {
				"AUD":        true,
				"BTC":        true,
				"CHF":        true,
				"CNY":        true,
				"EUR":        true,
				"GBP":        true,
				"ILS":        true,
				"JPY":        true,
				"LTC":        false,
				"NOK":        false,
				"USD":        true
			},
			gateways : [{
				name: "snapswap",
				addresses: [{
					address: "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
					currencies: ["USD"]
				}]
			}, {
				name: "bitstamp",
				addresses: [{
					address: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
					currencies: ["AUD", "BTC", "CHF", "EUR", "GBP", "JPY", "USD"]
				}]
			}, {
				name: "ripplecn",
				addresses: [{
					address: "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
					currencies: ["BTC", "CNY", "LTC"]
				}]
			}, {
				name: "ripplechina",
				addresses: [{
					address: "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",
					currencies: ["BTC", "CNY", "LTC"]
				}]
			}, {
				name: "justcoin",
				addresses: [{
					address: "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
					currencies: ["BTC", "LTC", "NOK"]
				}]
			},{name: "rippleisrael",
				addresses: [{
					address: "rNPRNzBB92BVpAhhZr4iXDTveCgV5Pofm9",
					currencies: ["ILS", "BTC", "LTC"]
				}]
			}]
		,
		minimumXRP : 100,
		currencyGates : {}
	}

	getOptionCurrencyGates();
	
    var state = document.readyState;
	
    if(state === 'interactive' || state === 'complete') {
        var remote = new Remote(optionsRemote);
		remote.connect(function() {
			remote.on('ledger_closed', ledgerListener);
		});
		createDom();
    }
    else setTimeout(arguments.callee, 100);
	
	function getOptionCurrencyGates() {
		for (cu in optionsFeed.currencies){
			var list = [];
			for (gateway in optionsFeed.gateways){
				for (add in optionsFeed.gateways[gateway].addresses){
					for (currency in optionsFeed.gateways[gateway].addresses[add].currencies){
						if(optionsFeed.gateways[gateway].addresses[add].currencies[currency] == cu){
							var data = {
								"address":optionsFeed.gateways[gateway].addresses[add].address,
								"buy": 1,
								"sell": 1
							}
							list[optionsFeed.gateways[gateway].name] = data;
						}
					}
				}
			}
			var dataCG = {
				"gateways":list
			}
			optionsFeed.currencyGates[cu] = dataCG;
		}
	}

	function createDom() {
		var htm = "";
		htm += '<table cellspacing="0" cellpadding="0" border="0"><colgroup><col class="currency"><col class="gateway"><col class="buy"><col class="sell"></colgroup>';
		htm += '<tr class="first"><td>Currency</td><td>Gateway</td><td>Buy</td><td>Sell</td></tr>';
		for (cu in optionsFeed.currencies){
			if(optionsFeed.currencies[cu]){
				for (gw in optionsFeed.currencyGates[cu].gateways){
					htm += '<tr id="'+cu+gw+'"><td>'+cu+'</td><td>'+gw+'</td><td>?</td><td>?</td></tr>'
				}
			}
		}
		htm += '</table><div id="ledger"></div>';
		document.getElementById("live").innerHTML = htm;
		var css = '#live table{margin-bottom:0 !important}#live table td { font-size:12px;} #live table tr.first {font-size:13px;}table td{padding:0px 4px;overflow:hidden}.currency{width:20%;}.gateway{width:26%;}.buy{width:27%;}.sell{width:27%;}.first,.first:hover{color:white;background-color:#666}tr:hover{background-color:rgba(0,0,0,0.1)}.updated{color:black;background-color:rgba(251,225,0,0.2)}#ledger{text-align:center;}',
			head = document.getElementsByTagName('head')[0],
			style = document.createElement('style');

		style.type = 'text/css';
		if (style.styleSheet){
		  style.styleSheet.cssText = css;
		} else {
		  style.appendChild(document.createTextNode(css));
		}

		head.appendChild(style);
	}
	
	function updated(cu,gw) {
		if(state === 'interactive' || state === 'complete') {
			var id = cu+gw;
			var entry = document.getElementById(id);
			var old2 = entry.getElementsByTagName("td")[2].innerHTML;
			var old3 = entry.getElementsByTagName("td")[3].innerHTML;
			var updt = false;
			if(old2 != optionsFeed.currencyGates[cu].gateways[gw].buy){
				entry.getElementsByTagName("td")[2].innerHTML = optionsFeed.currencyGates[cu].gateways[gw].buy;
				updt = true;
			}
			if(old3 != optionsFeed.currencyGates[cu].gateways[gw].sell){
				entry.getElementsByTagName("td")[3].innerHTML = optionsFeed.currencyGates[cu].gateways[gw].sell;
				updt = true;
			}
			if(updt){
				entry.className = "updated";
				var tmout = setTimeout(function(){
					entry.className = "";
				}, 1000);
			}
		}
	}

	function buyXRP(cur) {
		if(optionsFeed.currencies[cur]){
			for (gw in optionsFeed.currencyGates[cur].gateways){
				var gwAddress = optionsFeed.currencyGates[cur].gateways[gw].address;
				var request = remote.requestBookOffers({'currency':'XRP'},{'currency' : cur, 'issuer' : gwAddress},null,function(err, res) {
					if(res.offers.length != 0){
						var ammountIn = Amount.from_json(res.offers[0].TakerGets),
							ammountOut  = Amount.from_json(res.offers[0].TakerPays),
							thousands = ammountIn.to_human().split(",");
							thousands.splice(thousands.length-1,1).join("");
							counter = parseInt(thousands);
							if(isNaN(counter)){
								counter = 0;
							}
						for(var i = 1; counter <= optionsFeed.minimumXRP && i < res.offers.length; i++){
							var ammountInTemp  = Amount.from_json(res.offers[i].TakerGets);
							var ammountOutTemp  = Amount.from_json(res.offers[i].TakerPays);
							ammountIn = ammountIn.add(ammountInTemp);
							ammountOut = ammountOut.add(ammountOutTemp);
							thousands = ammountIn.to_human().split(",");
							thousands.splice(thousands.length-1,1).join("");
							counter = parseInt(thousands);
						}
						var rateAmount = ammountIn.ratio_human(ammountOut);
						var rate = rateAmount.to_human();
					} else {
						var rate = "/";
					}
					optionsFeed.currencyGates[this.CU].gateways[this.GW].buy = rate;
					updated(this.CU,this.GW);
				});
				request.CU = cur;
				request.GW = gw;
				request.request();
			}
		}
	} 

	function sellXRP(cur) {
		if(optionsFeed.currencies[cur]){
			for (gw in optionsFeed.currencyGates[cur].gateways){
				var gwAddress = optionsFeed.currencyGates[cur].gateways[gw].address;
				var request = remote.requestBookOffers({'currency' : cur, 'issuer' : gwAddress},{'currency' : 'XRP'},null, function(err, res) {
					if(res.offers.length != 0){
						var ammountIn = Amount.from_json(res.offers[0].TakerGets),
							ammountOut  = Amount.from_json(res.offers[0].TakerPays),
							thousands = ammountIn.to_human().split(",");
							thousands.splice(thousands.length-1,1).join("");
							counter = parseInt(thousands);
							if(isNaN(counter)){
								counter = 0;
							}
						for(var i = 1; counter <= optionsFeed.minimumXRP && i < res.offers.length; i++){
							var ammountInTemp  = Amount.from_json(res.offers[i].TakerGets);
							var ammountOutTemp  = Amount.from_json(res.offers[i].TakerPays);
							ammountIn = ammountIn.add(ammountInTemp);
							ammountOut = ammountOut.add(ammountOutTemp);
							thousands = ammountIn.to_human().split(",");
							thousands.splice(thousands.length-1,1).join("");
							counter = parseInt(thousands);
						}
						var rateAmount = ammountOut.ratio_human(ammountIn);
						var rate = rateAmount.to_human();
					} else {
						var rate = "/";
					}
					optionsFeed.currencyGates[this.CU].gateways[this.GW].sell = rate;
					updated(this.CU,this.GW);
				});
				request.CU = cur;
				request.GW = gw;
				request.request();
			}
		}
	}
	
	function ledgerListener (ledger_data) {
		document.getElementById("ledger").innerHTML = "Current ledger : "+ ledger_data.ledger_index;
		document.getElementById("ledger").className = "updated";
			var tmout = setTimeout(function(){
				document.getElementById("ledger").className = "";
		}, 1000);
		for (cu in optionsFeed.currencies){
			buyXRP(cu);
			sellXRP(cu);
		}
	}
	
})();