AppProductStatus = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
  
  
    init: function() {
        // console.log(Math.round(new Date().getTime()/1000.0));
        // var auctionstart = new Date( (Math.round(new Date().getTime()/1000.0 + 432000))* 1000);
        // console.log(auctionstart.toGMTString()+"<br>"+auctionstart.toLocaleString());

        // var myDate = new Date("November 11, 2018 10:39:00"); // Your timezone!
        // var myEpoch = myDate.getTime()/1000.0;
        // console.log(myEpoch);
        //Checking whether metamask is installed or not
        if (typeof web3 !== 'undefined'){
           console.log("loaded successfully")
           return AppProductStatus.initWeb3();
        } 
        else{
          swal("ERROR!", "Please Install METAMASK To Continue", "warning")
        }
    },
  
    initWeb3: function() {
       // TODO: refactor conditional
       if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        AppProductStatus.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        AppProductStatus.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
      return AppProductStatus.initContract();
    },
  
    initContract: function() {
      $.getJSON('initial.json', (initialContract) => {
        // Instantiate a new truffle contract from the artifact
        AppProductStatus.contracts.InitialContract = TruffleContract(initialContract);
        // Connect provider to interact with contract
        AppProductStatus.contracts.InitialContract.setProvider(AppProductStatus.web3Provider);
        AppProductStatus.contracts.InitialContract.deployed().then(function(initialContract) {
         // console.log("Initial contract Address:", initialContract.address);
        })
        AppProductStatus.listenForEvents();
        return AppProductStatus.render();
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
    //     AppProductStatus.contracts.InitialContract.deployed().then(function(instance) {
    //     ContractInstance = instance
    //     instance.DataIntoEntryGate({}, {
    //       fromBlock: 0,
    //       toBlock: 'latest',
    //     }).watch((error, event) => {
    //       console.log("event triggered", event);
    //       AppProductStatus.render();
    //       return ContractInstance.getGhash.call()
    //     }).then( (result) => {
    //         // console.log(result)
    //     })
    //   })
    },
  
    render: () => {
       // Load account data
       web3.eth.getCoinbase((err, account) => {
        if(err === null) {
            AppProductStatus.account = account;
          $('#address').html(account);
        }
       
      })
      AppProductStatus.renderData();
    },
    
    renderData: () => {
        AppProductStatus.contracts.InitialContract.deployed().then( (instance) => {
              ContractInstance = instance
              return ContractInstance.getGhash.call()
        }).then( (ots) => {
            console.log(ots)
            return ContractInstance.GetLotCount.call(ots)
        }).then( (count) => {
            let c = count;
            for(let i=0;i<c;i++)
            {
                ContractInstance.FarmerFetchProduct.call(i)
                .then( (result) => {
                    if(result[0]==0)
                        $("#container").append("<div class=\"col-md-4 col-sm-6\"><div class=\"pricingTable11\"><div class=\"pricingTable-header\"><i class=\"fa fa-exclamation-circle\"></i><div class=\"price-value\">Lot Number<span class=\"month\">"+result[7]+"</span> </div></div><h3 class=\"heading\">"+result[3]+"</h3><div class=\"pricing-content\"><ul><li><b>"+result[1]+"</b></li><li><b>"+result[2]+"</b></li><li><b>"+result[4]+"</b></li><li><b>"+result[6]+"</b> Bag Size</li><li><b>"+result[5]+"</b> No of Bags</li></ul></div><div class=\"pricingTable-signup\"><a  onClick=\"AppProductStatus.confirmProduct("+result[7]+");\" href=\"#\">Confirm</a><br><br><a  onClick=\"AppProductStatus.rejectproduct("+result[7]+");\" href=\"#\">Delete</a></div></div></div>")
                    else if(result[0]==1)
                        $("#container").append("<div class=\"col-md-4 col-sm-6\"><div class=\"pricingTable11 blue\"><div class=\"pricingTable-header\"><i class=\"fa fa-clock-o\" aria-hidden=\"true\"></i><div class=\"price-value\">Lot Number<span class=\"month\">"+result[7]+"</span> </div></div><h3 class=\"heading\">"+result[3]+"</h3><div class=\"pricing-content\"><ul><li><b>"+result[1]+"</b></li><li><b>"+result[2]+"</b></li><li><b>"+result[4]+"</b></li><li><b>"+result[6]+"</b> Bag Size</li><li><b>"+result[5]+"</b> No of Bags</li></ul></div><div class=\"pricingTable-signup\"><a  href=\"#\">Waiting For Bid</a></div></div></div>")
                    else if(result[0]==5)
                        $("#container").append("<div class=\"col-md-4 col-sm-6\"><div class=\"pricingTable11 red\"><div class=\"pricingTable-header\"><i class=\"fa fa-times\" aria-hidden=\"true\"></i><div class=\"price-value\">Lot Number<span class=\"month\">"+result[7]+"</span> </div></div><h3 class=\"heading\">"+result[3]+"</h3><div class=\"pricing-content\"><ul><li><b>"+result[1]+"</b></li><li><b>"+result[2]+"</b></li><li><b>"+result[4]+"</b></li><li><b>"+result[6]+"</b> Bag Size</li><li><b>"+result[5]+"</b> No of Bags</li></ul></div><div class=\"pricingTable-signup\"><a  href=\"#\">Rejected</a></div></div></div>")
                    })
                
            }
            
        })
    },
    
    confirmProduct: (lotnumber) => {
        AppProductStatus.contracts.InitialContract.deployed().then( (instance) => {
            ContractInstance = instance
            return ContractInstance.ConfirmProductByFarmer.sendTransaction(lotnumber, {
            from:AppProductStatus.account,
            })
        }).then( (result) => {
            if(result) {
                swal("Congratulations!", "Sucessfuly Confirmed", "success")
                location.reload();
            }
            else {
              console.log("errror")
            }
        }) 

    },

    rejectproduct: (lotnumber) => {
        AppProductStatus.contracts.InitialContract.deployed().then( (instance) => {
            ContractInstance = instance
            return ContractInstance.RejectProductByFarmer.sendTransaction(lotnumber, {
            from:AppProductStatus.account,
            })
        }).then( (result) => {
            if(result) {
                swal("Congratulations!", "Sucessfuly Removed", "success")
                location.reload();
            }
            else {
              console.log("errror")
            }
        }).catch( (err) => {
             console.log(err)
        }) 
    }
    


    },

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
        AppProductStatus.init();
    });
  });
  