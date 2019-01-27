pragma solidity ^0.4.4;

contract initial {


   /*==================================================STRUCTURES===========================================================*/
    
    struct Member {
        string uname;
        string checkGhash;
        string gender;
        string password;
        string actor;
        bool status;
        address member_address;
    }

    struct EntryGate{
        string FarmerName;
        string FarmerOTS;
        string FarmerAddress;
        string FarmerMandi;
        string FarmerState;
        string ProductName;
        string ProductQuality;
        int ProductBagSize;
        int ProductNoBags;
        int status;
        uint auctionstart;
        uint auctionend;
    }

    struct ArrayLotNumber{
        int[] FarmerLOTArray;
    }

    //=================================================STATIC VARIABLES===================================================*/
    // Also remembering the max_bid and the max_bidder to easily determine the winner.
    uint max_bid = 0;
    uint bid_amount;
    address creator;
    uint auction_start;
    uint auction_end;
  
    /*===================================================ARRAYS===========================================================*/
    //List of all farmers
    Member[] allMembers;
    int[] public LotNumber;

    /*===================================================MAPPINGS===========================================================*/
    
    //Mapping for address to Farmer deatails stored in structure
    mapping(address => Member) private MemberAddress;
    //Mappping for storing OTS 
    mapping(address => string) public AllCheckHash;
    //Mapping for checking ony OTS issued for each user
    mapping(address => bool) public GAllCheckHash;
    //Mapping for lot number to data of entry gate(lot number to product details)
    mapping(int => EntryGate) private FarmerEntryGate;
    //Mapping for OTS to FarmerProduct's Lot Number so to store the Farmer's product in his database
    mapping(string => ArrayLotNumber) FarmerLOTNo;
    //Mapping for address to bid amount for each buyer
    mapping (address => uint) bids;
    //Mapping for lotnumber to respective max bid
    mapping(int => uint) maxbid;
    //Mapping for lotnumber to respective max bidder
    mapping(int => address) max_bidder;

   

    /*====================================================EVENTS==============================================================*/
    //Event for generaring OTS
    event GHashEvent(
        address indexed _owner,
        string CheckHash
    );
    //Event for registering user
    event RegisterEvent(
        address indexed _owner,
        string uname
    );
    //Event for adding entry gate data
    event DataIntoEntryGate(
       string indexed _ots,
       int lotnumber
    );

    /*=====================================================MODIFIERS============================================================*/
   
   //For checking the status of OTS
    modifier checkAllHash() {
        require(!GAllCheckHash[msg.sender]);
        _;
    }

    //For checking if member is already register or not
    modifier checkReg() {
        require(!MemberAddress[msg.sender].status);
        _;
    }
    
    /*=====================================================CONSTRUCTOR============================================================*/
    constructor() public {
        MemberAddress[msg.sender].status = false;
        
    }

    /*=====================================================FUNCTIONS============================================================*/
    
    // internal function to compare strings 
    function stringsEqual(string memory _a, string memory _b) public pure returns (bool) {
        bytes memory a = bytes(_a);
        bytes memory b = bytes(_b);
        if(a.length != b.length)
            return false;
        for (uint i=0; i < a.length; i++)
        {
            if(a[i] != b[i])
                return false;
        }
        return true;
    }

  
    //This function return unique hash to the farmer as prove of farmer
    function addCheckHash(string chash) public payable checkAllHash returns(bool) {
        AllCheckHash[msg.sender] = chash;
        GAllCheckHash[msg.sender] = true;
        emit  GHashEvent(msg.sender,chash);
        return true;
    }

    function getGhash() public view returns(string) {
        if(GAllCheckHash[msg.sender] == true)
            return AllCheckHash[msg.sender];
        return "null";  
    }
  
    //function for adding farmer to the system
    // return 6 if government does not approve it as farmer
    // return 1 when it get overflowed
    // return 0 on success
    function addMember(string uname, string CheckGhash, string actor, string gender, string password) public payable checkReg returns(bool) {
        //checking whether it is farmer otn not
        require(stringsEqual(AllCheckHash[msg.sender],CheckGhash));
       
        MemberAddress[msg.sender].uname = uname;
        MemberAddress[msg.sender].checkGhash = CheckGhash;
        MemberAddress[msg.sender].actor = actor;
        MemberAddress[msg.sender].gender = gender;
        MemberAddress[msg.sender].password = password;
        MemberAddress[msg.sender].status = true;
        MemberAddress[msg.sender].member_address = msg.sender;
        emit RegisterEvent(msg.sender,uname);
        return true;
      
    }
    
    //function for checking the loging system
    function checkMember(string uname, string password) public payable returns(uint, string) {
        if(stringsEqual(MemberAddress[msg.sender].uname,uname) && stringsEqual(MemberAddress[msg.sender].password, password))
        {
            return (0, MemberAddress[msg.sender].actor);
        }
        return (1, "null");
        
    }

    //--------FUNCTIONS FOR ENTRY GATE------//
    
    //Function for adding data of EntryGate
    function AddEntryGate(int lotnumber, string fname, string fots, string fmandi, string fstate, string pname, string pquality, int pbs, int pnobag, uint auctionstart, uint auctionend) public payable returns(bool) {

        LotNumber.push(lotnumber);

        FarmerLOTNo[fots].FarmerLOTArray.push(lotnumber);
      
        FarmerEntryGate[lotnumber].FarmerName = fname;
        FarmerEntryGate[lotnumber].FarmerOTS = fots;
        FarmerEntryGate[lotnumber].FarmerMandi = fmandi;
        FarmerEntryGate[lotnumber].FarmerState = fstate;
        FarmerEntryGate[lotnumber].ProductName = pname;
        FarmerEntryGate[lotnumber].ProductQuality = pquality;
        FarmerEntryGate[lotnumber].ProductBagSize = pbs;
        FarmerEntryGate[lotnumber].ProductNoBags = pnobag;
        FarmerEntryGate[lotnumber].status = 0;
        FarmerEntryGate[lotnumber].auctionstart = auctionstart;
        FarmerEntryGate[lotnumber].auctionend = auctionend;

        emit DataIntoEntryGate(fots, lotnumber);
        return true;
    }

   //Function for  geting total count of LOTNUMBER of perticular farmer
    function GetLotCount(string fots) public returns(uint) {
        return FarmerLOTNo[fots].FarmerLOTArray.length;
    }

    //Function for changing status after farmer confirmed
    function ConfirmProductByFarmer(int lotnumber) public returns(bool) {
        FarmerEntryGate[lotnumber].status = 1;  
        return true;
    }

    //Function for changing status after farmer rejected the product
    function RejectProductByFarmer(int lotnumber) public returns(bool) {
        FarmerEntryGate[lotnumber].status = 5;  
        return true;
    }
    
    //Function for returning product details to Farmer
    function FarmerFetchProduct(uint index) public returns(int, string, string, string, string ,int, int, int) {

        string ots1 = AllCheckHash[msg.sender];

        for(uint i=index;i<FarmerLOTNo[ots1].FarmerLOTArray.length;i++)
        {
            return 
            (FarmerEntryGate[FarmerLOTNo[ots1].FarmerLOTArray[i]].status, 
            FarmerEntryGate[FarmerLOTNo[ots1].FarmerLOTArray[i]].FarmerMandi, 
            FarmerEntryGate[FarmerLOTNo[ots1].FarmerLOTArray[i]].FarmerState, 
            FarmerEntryGate[FarmerLOTNo[ots1].FarmerLOTArray[i]].ProductName,  
            FarmerEntryGate[FarmerLOTNo[ots1].FarmerLOTArray[i]].ProductQuality, 
            FarmerEntryGate[FarmerLOTNo[ots1].FarmerLOTArray[i]].ProductNoBags, 
            FarmerEntryGate[FarmerLOTNo[ots1].FarmerLOTArray[i]].ProductBagSize, 
            FarmerLOTNo[ots1].FarmerLOTArray[i]);
        }
        
        return (0,"null","null","null","null",0,0,0);  
    }
    
    //-----ENDING-----//


    //------Function For Bidders--------//
    function BidderFetchProduct(uint index) public returns(int, string, string, string, string ,int, int, int, uint, uint) {
        
        for(uint i=index;i<LotNumber.length;i++)
        {
            return (FarmerEntryGate[LotNumber[i]].status, 
            FarmerEntryGate[LotNumber[i]].FarmerMandi, 
            FarmerEntryGate[LotNumber[i]].FarmerState, 
            FarmerEntryGate[LotNumber[i]].ProductName,  
            FarmerEntryGate[LotNumber[i]].ProductQuality, 
            FarmerEntryGate[LotNumber[i]].ProductNoBags, 
            FarmerEntryGate[LotNumber[i]].ProductBagSize, 
            LotNumber[i],
            FarmerEntryGate[LotNumber[i]].auctionstart, 
            FarmerEntryGate[LotNumber[i]].auctionend);
        }
         
    }

    function getTotalLotCount() public returns(int) {
            return LotCount.length;
    }


    function GetProductByLotNumber(int lotnumber) public returns(string, string, string ,int, uint, int, uint) {
        return ( 
            FarmerEntryGate[lotnumber].FarmerMandi, 
            FarmerEntryGate[lotnumber].FarmerState, 
            FarmerEntryGate[lotnumber].ProductName,  
            FarmerEntryGate[lotnumber].ProductBagSize, 
            FarmerEntryGate[lotnumber].auctionstart,
            FarmerEntryGate[lotnumber].ProductNoBags,  
            FarmerEntryGate[lotnumber].auctionend);
    }

    //------ENDING------//


    //------Function for Auction-------// 

    function bid(int lotnumber) public payable returns(bool) {
        auction_start = FarmerEntryGate[lotnumber].auctionstart;
        auction_end = FarmerEntryGate[lotnumber].auctionend;
        //
        max_bid = maxbid[lotnumber];
        require(now>auction_start);
        require(now<auction_end);
        require(msg.value>0);
        bid_amount = bids[msg.sender] + msg.value;
        //
        require(bid_amount>max_bid);
        //
        max_bid = bid_amount;
        maxbid[lotnumber] = bid_amount;
        bids[msg.sender] = bid_amount; 
        max_bidder[lotnumber] = msg.sender;
        return  true;
    }

    function getMaxBid(int lotnumber) public returns(uint) {
        return maxbid[lotnumber];
    }

    function getYourBid() public returns(uint) {
        return bids[msg.sender];
    }

    function getMaxBidder(int lotnumber) public returns(address) {
        return max_bidder[lotnumber];
    }

    //---ENDING------//


}