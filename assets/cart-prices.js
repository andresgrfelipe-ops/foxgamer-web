(function(root){
  function repriceMacbooks(cart,prices){
    const merged=new Map();
    for(const old of cart){
      let item={...old};
      if(/^MacBook\b/.test(item.name)){
        const price=prices[item.name+'|'+item.condition];
        item.priceVerified=Number.isSafeInteger(price)&&price>0;
        if(item.priceVerified)item.price=price;
        item.id=[item.name,item.condition,item.price].join('|');
      }
      const previous=merged.get(item.id);
      if(previous)previous.qty+=item.qty;else merged.set(item.id,item);
    }
    return [...merged.values()];
  }
  root.FoxCartPrices={repriceMacbooks};
})(globalThis);
