AppAuction = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
  
  
    init: function() {
        //Checking whether metamask is installed or not
        if (typeof web3 !== 'undefined'){
           console.log("loaded successfully")
           return AppAuction.initWeb3();
        } 
        else{
          swal("ERROR!", "Please Install METAMASK To Continue", "warning")
        }
    },
  
    initWeb3: function() {
       // TODO: refactor conditional
       if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        AppAuction.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        AppAuction.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = (AppAuction.web3Provider);
      }
      return AppAuction.initContract();
    },
  
    initContract: function() {
      $.getJSON('initial.json', (initialContract) => {
        // Instantiate a new truffle contract from the artifact
        AppAuction.contracts.InitialContract = TruffleContract(initialContract);
        // Connect provider to interact with contract
        AppAuction.contracts.InitialContract.setProvider(AppAuction.web3Provider);
        AppAuction.contracts.InitialContract.deployed().then(function(initialContract) {
         // console.log("Initial contract Address:", initialContract.address);
        })
        AppAuction.listenForEvents();
        return AppAuction.render();
      })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: () => {
        AppAuction.contracts.InitialContract.deployed().then(function(instance) {
        ContractInstance = instance
        instance.DataIntoEntryGate({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch((error, event) => {
          console.log("event triggered", event);
          AppAuction.render();
          return ContractInstance.hasGhash.call()
        }).then( (result) => {
            console.log(result)
        })
      })
    },
  
    render: () => {
    //loading account's address and balance
    web3.eth.getCoinbase(function(err, account) {
        if (err === null) { 
          AppAuction.account = account;
          $("#account").text(account);
          web3.eth.getBalance(account, function(err, balance) {
            if (err === null) {
              $("#balance").text(web3.fromWei(balance, "ether") + " ETH");
            }
          });
        }
      });
      AppAuction.contracts.InitialContract.deployed().then( (instance) => {
          ContractInstance = instance;
          return ContractInstance.getMaxBid.call(sessionStorage.getItem("lotnumber"));
      }).then( (result) => {
         $("#hb").html(web3.fromWei(result, "ether") + " ETH");
         return ContractInstance.getYourBid.call();
      }).then( (amt) => {
        $("#bidamount").html(web3.fromWei(amt, "ether") + " ETH");
      })
      AppAuction.renderData();
    },
    
    renderData: () => {
        AppAuction.contracts.InitialContract.deployed().then( (instance) => {
            ContractInstance = instance;
            let lotnumber = sessionStorage.getItem("lotnumber");
            return ContractInstance.GetProductByLotNumber.call(lotnumber);
        }).then( (data) => {
           $("#lotnumber").html(sessionStorage.getItem("lotnumber"));
           $("#name").html(data[2]);
           $("#mandi").html(data[0]);
           $("#city").html(data[0]);
           $("#state").html(data[1]);
           $("#sd").html(EpochToDate(data[4].toNumber()));
           $("#ed").html(EpochToDate(data[6].toNumber()));
        }).catch( (err) => {
            console.log(err);
        })
    },   
    
    bid: () => {
        var bidamount = $("#value").val();
        AppAuction.contracts.InitialContract.deployed().then( (instance) => {
            ContractInstance = instance;
            return ContractInstance.bid.sendTransaction(sessionStorage.getItem('lotnumber'), {
                from:AppAuction.account,
                value: web3.toWei(bidamount, "ether"),
                gasLimit: 21000
            }).then( (result) => {
                console.log(result);
                swal("Congratulations!", "Amount Accepted", "success");
                setTimeout( () => {
                    location.reload();
                },900)
            }).catch( (err) => {
               console.log(err);
               swal("Error", "Your bidding amount less then highest bid", "warning");
            })
        })
    },

    }




    function formatDate(date)
    {
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        return  day+'/'+monthIndex+'/'+year;
    }

    function EpochToDate(epoch) {
        if (epoch < 10000000000)
            epoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
        var epoch = epoch + (new Date().getTimezoneOffset() * -1); //for timeZone   
        let d = new Date(epoch);
        setTimer(d)     
        var date = formatDate(new Date(epoch));
        return date;
    }
    function setTimer(deadline)
    {
        setInterval(interval,1000);
        function interval()
        {
        	var rt=document.getElementById("rt");
        	 var time=deadline - new Date();
             
                var days   =Math.floor(time/(1000*60*60*24));
                if(days<=0)
                    days = '00';
                var  hours  =Math.floor(time/(1000*60*60)%24);
                if(hours<=0)
                    days = '00';
                var minutes=Math.floor(time/(1000*60)%60);
                if(minutes<=0)
                    minutes = '00';
                var seconds =Math.floor((time/1000)%60);
                if(seconds<10)
                    seconds = '0'+seconds;
                var total  =time;
                $("#rt").html(days+"-"+hours+"-"+minutes+"-"+seconds) 
        }
    }

   
  $(function() {
    $(window).load(function() {
        AppAuction.init();
    });
  });
  