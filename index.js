//importing the depenencies
const express=require('express');
const app=express();

//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}..`));

//READ Request Handlers
app.get('/', (req, res) => {
    res.send('Welcome to LannisterPay Transaction Payment Spliting System (TPSS)');
    });
     
    //SPLIT PAYMENT ENDPOINT
    app.post('/split-payments/compute',(req,res)=>{
        const Payloads = {
            "ID": req.body.ID,
            "Amount": req.body.Amount,
            "Currency": req.body.Currency,
            "CustomerEmail": req.body.CustomerEmail,
            "SplitInfo": req.body.SplitInfo
        };

        //check if the SplitInfo info array count is less than 1(minimum) or greater 20(maximum)
        const SplitInfoCount=Payloads.SplitInfo.length;
        if(SplitInfoCount<1 ||SplitInfoCount>20){
            console.log("ERROR: The SplitInfo array can contain a minimum of 1 split entity and a maximum of 20 entities.");
            return;
        }

        //create a key to sort the splitinfo for easy computation
        const SplitOrder={
            "FLAT":0,
            "PERCENTAGE":1,
            "RATIO":2
        };
        const sortedSplitInfo=Payloads.SplitInfo.sort((a, b) => SplitOrder[a.SplitType] < SplitOrder[b.SplitType] ? -1 : 1);

        //split the payment and return the response
        const SplitPayment=computeSplit(Payloads.ID,Payloads.Amount,sortedSplitInfo);

            //books.push(book);
        res.send(SplitPayment);
    });

    function computeSplit(id,amount,splitInfo) {
        //declare initial Balance
        var Balance=amount;
        //loop through the Split Info and compute the breakdown
        var SplitBreakdown=[];
        
        //calculate the total ratio in the payment
        var totalRatios=getTotalRatio(splitInfo)
        var tmpBal=0;
        //declare opening ratio balance
        var openingRatioBalance=0;
        //COMPUTE AMOUNT BASED ON SPLIT TYPE
        splitInfo.forEach(el => {
            var SplitType=el.SplitType;
            var SplitValue=el.SplitValue;
            var SplitEntityId=el.SplitEntityId;
            var splitAmount=0;
            switch(SplitType){
                case 'FLAT':
                    splitAmount=SplitValue;
                    break;
        
                case 'PERCENTAGE':
                    splitAmount=(SplitValue*Balance)/100;
                    break;
        
                case 'RATIO':
                    //define ratio opening balance only when its nothing
                    if(openingRatioBalance==0){
                        openingRatioBalance=Balance;
                    }
                    splitAmount=((SplitValue/totalRatios)*openingRatioBalance);
                    
                    break;
        
                default:
                    break;  
            }
            SplitBreakdown.push({
                "SplitEntityId": SplitEntityId,
                "Amount": splitAmount
            });
            //reduce Balance by the splitamount
            Balance=Balance-splitAmount;
        });

        //split payment response array
        const paymentBreakdown={
            "ID": id,
            "Balance": Balance,
            "SplitBreakdown":SplitBreakdown
        };

        return paymentBreakdown; 
      };
    
      //FUNCTION TO GET THE TOTAL RATIO IN THE REQUEST
      function getTotalRatio(si) {
        var totalRatio=0;
        si.forEach(x => {
            if(x.SplitType=='RATIO'){
                totalRatio+=x.SplitValue;
            }
                
        });
        return totalRatio;
      };