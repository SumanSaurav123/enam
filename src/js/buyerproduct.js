BiddingStatus = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
  
  
    init: function() {
       var auctionstart =  Math.round(new Date().getTime()/1000.0);
        // var auctionstart = new Date( (Math.round(new Date().getTime()/1000.0 + 432000))* 1000);
        console.log(typeof auctionstart);
        

        // var myDate = new Date("November 11, 2018 10:39:00"); // Your timezone!
        // var myEpoch = myDate.getTime()/1000.0;
        // console.log(myEpoch);
        //Checking whether metamask is installed or not
        if (typeof web3 !== 'undefined'){
           console.log("loaded successfully")
           return BiddingStatus.initWeb3();
        } 
        else{
          swal("ERROR!", "Please Install METAMASK To Continue", "warning")
        }
    },
  
    initWeb3: function() {
       // TODO: refactor conditional
       if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        BiddingStatus.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        BiddingStatus.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
      return BiddingStatus.initContract();
    },
  
    initContract: function() {
      $.getJSON('initial.json', (initialContract) => {
        // Instantiate a new truffle contract from the artifact
        BiddingStatus.contracts.InitialContract = TruffleContract(initialContract);
        // Connect provider to interact with contract
        BiddingStatus.contracts.InitialContract.setProvider(BiddingStatus.web3Provider);
        BiddingStatus.contracts.InitialContract.deployed().then(function(initialContract) {
         // console.log("Initial contract Address:", initialContract.address);
        })
        BiddingStatus.listenForEvents();
        return BiddingStatus.render();
      })
      // .done( () => {
      //   $.getJSON('GovEmp.json', (GovEmpContract) => {
      //     // Instantiate a new truffle contract from the artifact
      //   App.contracts.GovEmpContract = TruffleContract(GovEmpContract);
      //   // Connect provider to interact with contract
      //   App.contracts.GovEmpContract.setProvider(App.web3Provider);
      //   App.contracts.GovEmpContract.deployed().then(function(GovEmpContract) {
      //     console.log("GovEmp contract Address:", GovEmpContract.address);
      //   })
      // })
      // })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: () => {
        BiddingStatus.contracts.InitialContract.deployed().then(function(instance) {
        ContractInstance = instance
        instance.DataIntoEntryGate({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch((error, event) => {
          console.log("event triggered", event);
          BiddingStatus.render();
          return ContractInstance.hasGhash.call()
        }).then( (result) => {
            console.log(result)
        })
      })
    },
  
    render: () => {
       // Load account data
       web3.eth.getCoinbase((err, account) => {
        if(err === null) {
            BiddingStatus.account = account;
          $('#address').html(account);
        }
       
      })
      BiddingStatus.renderData();
    },
    
    renderData: () => {
        BiddingStatus.contracts.InitialContract.deployed().then( (instance) => {
              ContractInstance = instance
            return ContractInstance.GetTotalLotCount.call()
        }).then( (count) => {
            let c = count;
            for(let i=0;i<c;i++)
            {
                ContractInstance.BidderFetchProduct.call()
                .then( (result) => {
                    console.log(result)
                    if(result[0].toNumber()==1)
                    {
                        $("#container").append("<div class=\"col-md-4 col-sm-6\"><div class=\"pricingTable11 yellow\"><div class=\"pricingTable-header\"><i class=\"fa fa-clock-o\" aria-hidden=\"true\"></i><div class=\"price-value\">Lot Number<span class=\"month\">"+result[7]+"</span> </div></div><h3 class=\"heading\">"+result[3]+"</h3><div class=\"pricing-content\"><ul><li><b>City - </b>"+ result[1]+"</li><li><b>State - </b>" +result[2]+"</li><li><b>Quality - </b> "+result[4]+"</li><li><b>Bag Size - </b> "+result[5]+"</li><li><b>Number Of Bags - </b>" +result[6]+"</li><li><b>Beginning Date - </b><span>"+ EpochToDate(result[8].toNumber())+"</span></li><li><b>Ending Date - </b>"+EpochToDate(result[9].toNumber())+"</li></ul></div><div class=\"pricingTable-signup\"><a href=\"#\" onClick=\"BiddingStatus.checkBiddingStarted("+result[8]+","+result[7]+")\">Bid</a></div></div></div>")
                    }
                })
                
            }
        })
       
    },

    checkBiddingStarted: (data,lotnumber) =>{
        let auctionDate = data*1000;
        var date  = new Date().getTime()
        if(date<auctionDate)
        {
            console.log(lotnumber)
            swal("Opps!", "Not Started Yet!", "info");
        } 
        else
        {
            sessionStorage.setItem("lotnumber",lotnumber);
            swal("Success", "Bidding Started", "success");
            setTimeout(() => {
                window.location = 'auction.html';
            }, 2000);
        } 
    },
    
   
    


    }

    function formatDate(date)
    {
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        return  day + ' ' + monthNames[monthIndex] + ' ' + year;
    }

    function EpochToDate(epoch) {
        if (epoch < 10000000000)
            epoch *= 1000; // convert to milliseconds (Epoch is usually expressed in seconds, but Javascript uses Milliseconds)
        var epoch = epoch + (new Date().getTimezoneOffset() * -1); //for timeZone        
        var date = formatDate(new Date(epoch));
        return date;
    }

    // demoFromHTML: function(){
    //   $("#download").html("Downloading...")
    //   setTimeout(() => {
    //     var pdf = new jsPDF('p', 'pt', 'letter');
    //     // source can be HTML-formatted string, or a reference
    //     // to an actual DOM element from which the text will be scraped.
    //     source = $('#invoice')[0];
    
    //     // we support special element handlers. Register them with jQuery-style 
    //     // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
    //     // There is no support for any other type of selectors 
    //     // (class, of compound) at this time.
    //     specialElementHandlers = {
    //         // element with id of "bypass" - jQuery style selector
    //         '#bypassme': function (element, renderer) {
    //             // true = "handled elsewhere, bypass text extraction"
    //             return true
    //         }
    //     };
    //     margins = {
    //         top:30,
    //         bottom:80, 
    //         width: 522
    //     };
    //     // all coords and widths are in jsPDF instance's declared units
    //     // 'inches' in this case
    //     pdf.fromHTML(
    //     source, // HTML string or DOM elem ref.
    //     margins.left, // x coord
    //     margins.top, { // y coord
    //         'width': margins.width, // max width of content on PDF
    //         'elementHandlers': specialElementHandlers
    //     },
    
    //     function (dispose) {
    //         // dispose: object with X, Y of the last line add to the PDF 
    //         //          this allow the insertion of new lines after html
    //         pdf.save('Test.pdf');
    //     }, margins);
    //   }, 3000)
    //   setTimeout(() => {
    //     $("#download").html("Save And Download")
    //   },3000)
  //},
  
  
  
  $(function() {
    $(window).load(function() {
        BiddingStatus.init();
    });
  });
  