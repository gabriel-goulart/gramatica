$( document ).ready(function() {
   // grammar functions
   window.workspace = new Workspace;

   // add action button
   $("#adicionar_gramatica_btn").click(function() {
		//alert('aqui');
        workspace.addGrammar($("#textGrammar").val());
 	});
  
});


window.Workspace = function() {
	// atributes
	this.addedGrammars = [];
	this.grammarId = 0;	
	
	// add grammar function
	this.addGrammar = function(grammar){
		//alert(grammar);
		// verifying grammar
		var isFactored = true;
		if ("string" == typeof grammar) {
            if ("" == grammar.trim()) return void this.error("A gramática não pode ser vázia");
            try {
            	//creating a new grammar
                n = new Grammar(grammar);
                n.transform();
                isFactored = n.isFactored();
                console.log(isFactored);
            } catch (r) {
                
            }
            // adding the new grammar to the list of added grammars
            this.addedGrammars[this.grammarId] = n;
            // rendering on interface            
            this.grammarInterface(this.grammarId, isFactored);
            //updating grammarId
            this.grammarId ++;
           
        } 
	}

	this.calcFirst = function(element){
		//alert("aq");
		var first = this.addedGrammars[element.id].calcFirst();
		var data = "";
		for(var f in first){
			data +=  f + " : { " + first[f] + " } <br/>"; 
		}
		var table = "<table class='grammar_data' id=table_"+element.id+">" +
					"<tr> <td> Gramática [First] - "+ element.id +"</td></tr>" +
					"<tr><td>"+data+"</td></tr>"+
					"</table>";
		$('#first_dados').append(table);			
	}

	// calc first NT
	this.calcFirstNt = function(element){
		var firstNt = this.addedGrammars[element.id].calcFirstNt();
		var data = "";
		for(var f in firstNt){
			data += " " + f + " : { " + firstNt[f] + " } <br/>"; 
		}
		var table = "<table class='grammar_data' id=table_"+element.id+">" +
					"<tr> <td> Gramática [First NT] - "+ element.id +"</td></tr>" +
					"<tr><td>"+data+"</td></tr>"+
					"</table>";
		$('#first_dados').append(table);		
	}

	// calc follow
	this.calcFollow = function(element){
		var follow = this.addedGrammars[element.id].calcFollow();

		var data = "";
		var exp = /^[A-Z]+$/;
		for(var f in follow){
			if(exp.test(f)){
				data += " " + f + " : { " + follow[f] + " } <br/>"; 
			}			
		}
		var table = "<table class='grammar_data' id=table_"+element.id+">" +
					"<tr> <td> Gramática [Follow] - "+ element.id +"</td></tr>" +
					"<tr><td>"+data+"</td></tr>"+
					"</table>";
		$('#follow_dados').append(table);
	}

	// removing grammar
	this.close_grammar = function(element){
		//alert(element.id);
		$("#table_"+element.id).remove();
		this.addedGrammars.splice(element.id,1);
		//console.log(this.addedGrammars);
		//console.log($("#"+element.id).parent().parent().parent().parent().attr('id'));
	}

	// printing on interface the grammar
	this.grammarInterface = function(grammarId, isFactored){
		var factored = isFactored ? "Fatorada":"Não Fatorada"; 
		var table = "<table class='grammar_data' id=table_"+grammarId+">" + 
					"<tr> <td> Gramática - "+ grammarId +" ["+ factored+"]</td></tr>" +
					"<tr> <td> <button class='btn btn-danger' id="+grammarId+" onclick='workspace.close_grammar(this)'> X </button> <button class='btn btn-success' id="+grammarId+" onclick='workspace.calcFirst(this)'> First </button> <button class='btn btn-success' id="+grammarId+" onclick='workspace.calcFirstNt(this)'> FirstNt </button> <button class='btn btn-success' id="+grammarId+" onclick='workspace.calcFollow(this)'> Follow </button></td></tr>" +
					"<tr> <td> <textarea readonly style='width:200px;height:100px'>"+this.addedGrammars[grammarId] +"</textarea></td> </tr>" +
					"</table>";
		$('#grammar_dados').append(table);
	}
	// error function
	this.error = function(error){
		alert(error);
	}
}

// grammar functions
window.Grammar = function(grammar){
	this.grammarString = grammar;
	this.productions = {};
	this.first = {};
	this.firstNt = {};
	this.follow = {};

	// transforming the string in array indexed by non-terminais
	this.transform = function(){
		var grammar = this.grammarString;
		var producoes = grammar.split("\n");
		this.productions = new Object();
		for (var i = 0; i < producoes.length; i ++) {
			var p = producoes[i].split("->");

			this.productions[p[0]] = p[1];
		}

		//console.log(this.productions);
		return this.productions;
	}

	// calc grammar's first set
	this.calcFirst = function(){

		this.first = new Object();
		/*for(var i in this.productions){
			this.first[i] = "";
		} */

		var change = true;

		while(change){
			change = false;
			for(var i in this.productions){

				// init variables
				key = i; 

				if(this.first[i] === undefined){
					change = true;
					this.first[i] = "";
					this.firstNt[i]= "";
					//console.log(this.productions[i]);
					var prod = this.productions[i].split("|");

					// calculating the grammar's first
					if(Array.isArray(prod)){

						for (var y = 0; y < prod.length; y++) {
							var aux = prod[y].trim();
							this.first[key] += aux.slice(0,1) + "  ";

							if(aux.slice(0,1).toUpperCase() === aux.slice(0,1)){
								this.firstNt[key] += aux.slice(0,1) + " ";
							}
						}
						this.firstNt[key] = this.firstNt[key].replace("&","");				
					}else{
						var aux = prod.trim();
						this.first[key] = aux.slice(0,1);
						if(aux.slice(0,1).toUpperCase() === aux.slice(0,1)){
								this.firstNt[key] += aux.slice(0,1) + " ";
						}
					}

				}			
				

				// propagating the modifications 
				for (var f in this.first) {
				 	
					if(this.first[f].indexOf(key) != -1){
						change = true;
						
						var str = "";
						
						// verifying if the terminal is already included in the first set
						var aux = this.first[key].split(" ");
						for (var a in aux) {
							if(this.first[f].indexOf(aux[a]) == -1){
								str += aux[a] + " ";
							}
						}
						// replacing the non-terminal by its first
						this.first[f] = this.first[f].replace(key,str);	
						
					}
				} 
			}
		}		

		//console.log(this.first);
		return this.first;
	}

	this.calcFirstNt = function(){
		this.calcFirst();
		return this.firstNt;
	}
	// calc the grammar's follow set
	this.calcFollow=function(){

		var first = this.calcFirst();
		var firstFinal = {};
		this.follow = new Object();

		var firstSymbol = true;
		for(var f in first){

			if(firstSymbol){
				// first rule
				this.follow[f.trim()] = "$";
				firstSymbol = false;
				firstFinal[f.trim()] = first[f]; 
			}else{
				this.follow[f.trim()] = " ";
				firstFinal[f.trim()] = first[f];	
			}
			
		}

		var change = true;
		var followOld = {};
		while(change){
			//change = false;

			for(var i in this.productions){
				var prod = this.productions[i].split("|");
					//console.log(prod.length);
					// calculating the grammar's follow
					if(Array.isArray(prod)){

						for (var y = 0; y < prod.length; y++) {
							var aux = prod[y].trim();
							aux = aux.replace(" ", ""); 
							for(var p = 0; p < aux.length; p++){
								
								var aux2 = aux.charAt(p);
								//console.log(aux2);
								if(aux2.toUpperCase() === aux2 && aux2 !== ""){
									
									
									if( p+1 < aux.length){
										//rule 2
										if(aux.charAt(p+1).toUpperCase() === aux.charAt(p+1) && aux.charAt(p+1) !== ""){
											//non-terminal
											//console.log(firstFinal[aux.charAt(p+1)]);
											if(firstFinal[aux.charAt(p+1)] !== undefined){
												var followProd = firstFinal[aux.charAt(p+1)].replace("&","");											
												this.follow[aux2] += followProd + " ";

												//rule 3
												if(firstFinal[aux.charAt(p+1)].indexOf('&') != -1){
													//console.log("posicao " + this.follow[i.trim()]);
													this.follow[aux2] += this.follow[i.trim()] + " ";
												}
											}											

											
										}else{
											//terminal
											if(aux.charAt(p+1) !== "&"){
												this.follow[aux2] += aux.charAt(p+1) + " ";	
											}										
										}
									}else{
										//rule 3
										this.follow[aux2] += this.follow[i.trim()] + " ";
									}

									this.follow[aux2] = this.follow[aux2].replace("undefined", "");
									
								}
							}							
						}				
					}
			}
			// verify if a change has happened
			if(followOld == this.follow){ change = false;}
			followOld = this.follow;

		}
		//cleaning up repeated symbols
		for(var f in this.follow){
			var aux = this.follow[f];
			this.follow[f] = aux.trim();
			var followString = "";
			for(var i=0 ; i < aux.length ; i++){
				var p = aux.charAt(i);
				if(followString.indexOf(p) == -1 && p != "" && p != " "){
					followString += p + " ";
				}
			}
			this.follow[f] = followString;
		} 

		
		//console.log(this.follow);
		return this.follow;
	}

	// verify if the grammar is factored
	this.isFactored = function(){
		var first = this.calcFirst();

		for(var i in this.productions)
		{ 	
			var prod = this.productions[i].split("|");

			if(prod.length > 1){
				var firstSymbol = [""];
				for (var y = 0; y < prod.length; y++) {					
					var symbol = prod[y];
					symbol = symbol.trim();
					symbol = symbol.charAt(0);
					if(symbol.toUpperCase() === symbol){
						//non-terminal
						var p = first[symbol];
						var symbolFirst = p.split[" "];
						for(var z= 0; z < symbolFirst.length; z++){
							if(symbolFirst[z] !== " "){
								if(firstSymbol.indexOf(symbolFirst[z]) !== -1){
									return false;
								}else{
									firstSymbol.push(symbolFirst[z]);
								}
							}
						}
					}else{
						// terminal
						if(firstSymbol.indexOf(symbol) !== -1){
							return false;
						}else{
							firstSymbol.push(symbol);
						}
					}
				} 
			}
		}

		return true;
	}

	this.toString = function(){
		return this.grammarString;
	}

}