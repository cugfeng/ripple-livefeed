var optionsFeed = {
			currencies:    {
				"AUD":        true,
				"BTC":        true,
				"BRL":        true,
				"CAD":        true,
				"CHF":        true,
				"CNY":        true,
				"DKK":        true,
				"EUR":        true,
				"GBP":        true,
				"ILS":        true,
				"JPY":        true,
				"LTC":        false,
				"SEK":        true,
				"NOK":        true,
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
					currencies: ["BTC", "LTC"]
				}]
			},{name: "rippleisrael",
				addresses: [{
					address: "rNPRNzBB92BVpAhhZr4iXDTveCgV5Pofm9",
					currencies: ["ILS", "BTC", "LTC"]
				}]
			},{name: "rippleunion",
				addresses: [{
					address: "r3ADD8kXSUKHd6zTCKfnKT3zV9EZHjzp1S",
					currencies: ["CAD"]
				}]
			},{name: "ripplemoney",
				addresses: [{
					address: "rkH1aQbL2ajA7HUsx8VQRuL3VaEByHELm",
					currencies: ["GBP"]
				}]
			},{name: "ripplefund",
				addresses: [{
					address: "rE7CNMbxwvTQrqSEjbcXCrqeN6EZga1ApU",
					currencies: ["GBP"]
				}]
			},{name: "wisepass",
				addresses: [{
					address: "rPDXxSZcuVL3ZWoyU82bcde3zwvmShkRyF",
					currencies: ["USD", "BRL", "BTC", "CAD", "CHF", "DKK", "EUR", "GBP", "JPY", "LTC", "NOK", "NOK"]
				}]
			}]
		,
		minimumXRP : 100,
		decimals : 3,
		currencyGates : {}
	};

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
		htm += '<tr class="ledger"><td></td><td>Current</td><td>ledger</td><td>?</td></tr></table>';
		document.getElementById("ripple-livefeed").innerHTML = htm;
		var css = '#ripple-livefeed table {margin-bottom:0!important;min-width:100%;max-width:100%;}#ripple-livefeed table td {font-size:12px;}#ripple-livefeed table tr.first {font-size:13px;}#ripple-livefeed table td {overflow:hidden;padding:0 4px;}#ripple-livefeed .currency {min-width:20%;max-width:20%;overflow:hidden;}#ripple-livefeed .gateway {min-width:26%;max-width:26%;overflow:hidden;}#ripple-livefeed .first,#ripple-livefeed .first:hover {color:#FFF;background-color:#666;}#ripple-livefeed tr:hover {background-color:rgba(0,0,0,0.1);}#ripple-livefeed .updated {color:#000;background-color:rgba(251,225,0,0.2);}#ripple-livefeed #ledger {text-align:center;}#ripple-livefeed .buy,.sell {min-width:27%;max-width:27%;overflow:hidden;}',
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
			var entry = document.getElementById(id),
			pdt = false;
			var old2 = entry.getElementsByTagName("td")[2].innerHTML,
				old3 = entry.getElementsByTagName("td")[3].innerHTML;
			if(old2 != optionsFeed.currencyGates[cu].gateways[gw].buy){
				entry.getElementsByTagName("td")[2].innerHTML = optionsFeed.currencyGates[cu].gateways[gw].buy;
				updt = true;
			}
			if(old3 != optionsFeed.currencyGates[cu].gateways[gw].sell){
				entry.getElementsByTagName("td")[3].innerHTML = optionsFeed.currencyGates[cu].gateways[gw].sell;
				updt = true;
			}
			if(optionsFeed.currencyGates[cu].gateways[gw].buy === "/" && optionsFeed.currencyGates[cu].gateways[gw].buy === "/"){
				entry.style.display = "none";
			} else {
				entry.style.display = "";
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
						var opts = new Object;;
						if(optionsFeed.decimals != 0){
							opts.precision = optionsFeed.decimals
						}
						var rate = rateAmount.to_human(opts);
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
						var opts = new Object;
						if(optionsFeed.decimals != 0){
							opts.precision = optionsFeed.decimals
						}
						var rate = rateAmount.to_human(opts);
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
		document.getElementsByClassName("ledger")[0].getElementsByTagName("td")[3].innerHTML = ledger_data.ledger_index;
		document.getElementsByClassName("ledger")[0].className += " updated";
			var tmout = setTimeout(function(){
				document.getElementsByClassName("ledger")[0].className = "ledger";
		}, 1000);
		for (cu in optionsFeed.currencies){
			buyXRP(cu);
			sellXRP(cu);
		}
	}
	
})();