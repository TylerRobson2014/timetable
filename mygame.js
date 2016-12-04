var positionX;
var positionY;

function dragstarted() {
  d3.select(this).raise().classed("active", true);
}

function dragged() {
  d3.select(this).attr("cx", this.posX = d3.event.x).attr("cy", this.posY = d3.event.y);
}

function dragended() {
  d3.select(this).classed("active", false);
}

var drag = d3.behavior.drag().on("drag", dragmove);

function dragmove() {
  this.posX = d3.event.x;
  this.posY = d3.event.y;
  //balls[index].posX = this.posX;
  //balls[index].posY = this.posY;
  //console.log("In DRAG",this.posX,this.posY);
  d3.select(this).attr("cx", this.posX).attr("cy", this.posY);
  var index = +d3.select(this).attr("id").slice(1, 2);
  balls[index].posX = d3.event.x;
  balls[index].posY = d3.event.y;
//  d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
}

var batdrag = d3.behavior.drag()
				.origin(function() { 
							var index = +d3.select(this).attr("id").slice(1, 2);
							return {x: bats[index].posX, y: bats[index].posY};
						})
				.on("drag", batdragmove);

function batdragmove() {
  //this.posX = d3.event.x;
  var index = +d3.select(this).attr("id").slice(1, 2);
  //console.log("The pos is",index);
  var height = document.getElementById("mainDiv").clientHeight;
  var posY = bats[index].posY;
  var batH = bats[index].batHeight;
  this.posY = d3.event.y;
  if (this.posY < 0 ){this.posY = 0;}
  if (this.posY+batH > height ){this.posY = height-batH;}
  //this.posX = 20;
  //balls[index].posX = this.posX;
  //balls[index].posY = this.posY;
  //console.log("In DRAG",this.posX,this.posY);
  d3.select(this).attr("y", this.posY);//.attr("x", this.posX).attr("y", this.posY);
  //d3.select(this).attr("transform", "translate(" + 0 + "," + this.posY + ")");
  
  //bats[index].posX = d3.event.x;
  bats[index].posY = this.posY;//d3.event.y;
//  d3.select(this).attr("transform", "translate(" + x + "," + y + ")");
}

	// Bat object
	function Bat(svg,x,y,id,w,h){
	this.posX = x;
	this.posY = y;
	this.id = id;
	this.batWidth = w;
	this.batHeight = h;
	this.initialHeight = h;
	this.svg = svg; // parent SVG
	this.data = [this.id]; // allow us to use d3.enter()

	this.Draw = function(){
            var svg = this.svg;
            var bat = svg.selectAll('#' + this.id)
                        .data(this.data);
               
            var myBat = bat.enter()
                .append("rect")
				.attr("id", this.id)
				.attr("class","bat")
                .attr("x", this.posX)
                .attr("y", this.posY)
                .attr("width", this.batWidth)
                .attr("height", this.batHeight);
            bat
                //.transition()//.duration(50)
                .attr("x", this.posX)
                .attr("y", this.posY)//.call(drag);
				//.attr("transform", "translate(" + this.posX + "," + this.posY + ")")
				.call(batdrag);
	}
	}
	
    // Ball object - multiple balls can be created by instantiating new objects
    function Ball(svg, x, y, id, color,aoa,radius) {
        this.posX = x; // cx
        this.posY = y; // cy
		//positionX = this.posX;
		//positionY = this.posY;
        this.color = color;
		this.aoa = aoa; // initial angle of attack
        this.radius = radius; // radius and weight same
        this.jumpSize = 1; // equivalent of speed default to 1
        this.svg = svg; // parent SVG
        this.id = id; // id of ball

        this.data = [this.id]; // allow us to use d3.enter()

        // **** aoa is used only here -- earlier I was using to next move position.
        // Now aoa and speed together is velocity 
        this.vx = Math.cos(this.aoa) * this.jumpSize; // velocity x
        this.vy = Math.sin(this.aoa) * this.jumpSize; // velocity y
        this.initialVx = this.vx;
        this.initialVy = this.vy;
        this.initialPosX = this.posX;
        this.initialPosY = this.posY;

        this.Draw = function () {
//			this.posX = positionX;
//			this.posY = positionY;
            var svg = this.svg;
            var ball = svg.selectAll('#' + this.id)
                        .data(this.data);
               
            var myBall = ball.enter()
                .append("circle")
				.attr("id", this.id)
				.attr("class","ball")
				.attr("r",this.radius)
				.attr("weight",this.weight)
                .style("fill", this.color);
            ball
                //.transition()//.duration(50)
                .attr("cx", this.posX)
                .attr("cy", this.posY)//.call(drag);
				//.attr("transform", "translate(" + this.posX + "," + this.posY + ")")
				.call(drag);
			  //console.log("In DRAW",this.posX,this.posY);
     		//ball.call(d3.drag()
			//	  .on("start", dragstarted)
			// 	  .on("drag", dragged)
			//	  .on("end", dragended));
            // intersect ball is used to show collision effect - every ball has it's own intersect ball
            var intersectBall = ball.enter()
                                .append('circle')
                                .attr('id',this.id + '_intersect') 
								.attr('class', 'intersectBall' );

        }

        this.Move = function () {
            var svg = this.svg;
			
//			this.posX = balls[index].posX;
//			this.posY = balls[index].posY;
			
            this.posX += this.vx;
            this.posY += this.vy;

            if (parseInt(svg.attr('width')) <= (this.posX + this.radius)) {
                this.posX = parseInt(svg.attr('width')) - this.radius - 1;
                this.aoa = Math.PI - this.aoa;
                this.vx = -this.vx; 
				svg.select('#'+bats[1].id)
					.transition()
					.duration(5000)
					.styleTween("fill", function() { return d3.interpolate("yellow", "black"); })
					.attr('height', bats[1].batHeight-1);
				bats[1].batHeight = bats[1].batHeight-1;
				if (bats[0].batHeight <= bats[0].initialHeight+20){
					svg.select('#'+bats[0].id)
						.transition()
						.duration(5000)
						.styleTween("fill", function() { return d3.interpolate("green", "black"); })
						.attr('height', bats[0].batHeight+1);
					bats[0].batHeight = bats[0].batHeight+1;
				}
            }

            if (this.posX < this.radius) {
                this.posX = this.radius+1;
                this.aoa = Math.PI - this.aoa;
                this.vx = -this.vx;
				svg.select('#'+bats[0].id)
					.transition()
					.duration(5000)
					.styleTween("fill", function() { return d3.interpolate("yellow", "black"); })
					.attr('height', bats[0].batHeight-1);
				bats[0].batHeight = bats[0].batHeight-1;
				if (bats[1].batHeight <= bats[1].initialHeight+20){
					svg.select('#'+bats[1].id)
						.transition()
						.duration(5000)
						.styleTween("fill", function() { return d3.interpolate("green", "black"); })
						.attr('height', bats[1].batHeight+1);
					bats[1].batHeight = bats[1].batHeight+1;
				}
            }

            if (parseInt(svg.attr('height')) < (this.posY + this.radius)) {
			    //console.log(svg.attr('height'));
                this.posY = parseInt(svg.attr('height')) - this.radius - 1;
                this.aoa = 2 * Math.PI - this.aoa;
                this.vy = -this.vy;
            }

            if (this.posY < this.radius) {
                this.posY = this.radius+1;
                this.aoa = 2 * Math.PI - this.aoa;
                this.vy = -this.vy;
            }
			var topHit = false;
			var botHit = false;
			var inRange = false;
			var sideHit = false;
			var confirmFront = false;
			var confirmTop = false;
			var angleFront = Math.atan(bats[0].batHeight/bats[0].batWidth);
			var angleBallABS = Math.atan(Math.abs(this.posY-(bats[0].posY+bats[0].batHeight/2))/Math.abs(this.posX-(bats[0].posX+bats[0].batWidth/2)));
			var angleBall = Math.atan((this.posY-(bats[0].posY+bats[0].batHeight/2))/(this.posX-(bats[0].posX+bats[0].batWidth/2)));
			if (angleBallABS <= angleFront){confirmFront = true;}
			if (angleBallABS > angleFront && this.posY-(bats[0].posY+bats[0].batHeight/2)<0){confirmTop = true;}
			if (angleBallABS > angleFront && this.posY-(bats[0].posY+bats[0].batHeight/2)>0){confirmBot = true;}
			//console.log(angleBallABS*(180.0/3.14),angleBall*(180./3.14));

			if (this.posX < (bats[0].posX + bats[0].batWidth) && this.posY+this.radius > bats[0].posY && confirmTop){topHit = true;}
			if (this.posX < (bats[0].posX + bats[0].batWidth) && this.posY-this.radius < bats[0].posY+bats[0].batHeight && !confirmTop){botHit = true;}
			if (this.posY+this.radius > bats[0].posY && this.posY-this.radius < bats[0].posY+bats[0].batHeight){inRange = true;}
			if (this.posX - this.radius < (bats[0].posX + bats[0].batWidth) && inRange && confirmFront){sideHit = true;}
			if (sideHit){
                this.posX = bats[0].posX + bats[0].batWidth+this.radius + 1;
                this.aoa = Math.PI - this.aoa;
                this.vx = -this.vx;
				//console.log("0 side");
				// show collision effect for 500 miliseconds
				var intersectBall = svg.select('#'+this.id + '_intersect');
				intersectBall.attr('cx', (bats[0].posX+bats[0].batWidth+this.posX)/2).attr('cy', this.posY).attr('r', 10).attr('fill', 'red' )
							.transition()
							.duration(500)
							.attr('r', 0);
			}else if (topHit){
				this.posY = bats[0].posY - this.radius - 1;
                this.aoa = 2 * Math.PI - this.aoa;
                this.vy = -this.vy;
				console.log("0 top");
			}else if (botHit){
				this.posY = bats[0].posY +bats[0].batHeight + this.radius + 1;
                this.aoa = 2 * Math.PI - this.aoa;
                this.vy = -this.vy;
				console.log("0 bot");
			}

			
			var topHit = false;
			var botHit = false;
			var inRange = false;
			var sideHit = false;
			var confirmFront = false;
			var confirmTop = false;
			var angleFront = Math.atan(bats[1].batHeight/bats[1].batWidth);
			var angleBallABS = Math.atan(Math.abs(this.posY-(bats[1].posY+bats[1].batHeight/2))/Math.abs(this.posX-(bats[1].posX+bats[1].batWidth/2)));
			var angleBall = Math.atan((this.posY-(bats[1].posY+bats[1].batHeight/2))/(this.posX-(bats[1].posX+bats[1].batWidth/2)));
			if (angleBallABS <= angleFront){confirmFront = true;}
			if (angleBallABS > angleFront && this.posY-(bats[1].posY+bats[1].batHeight/2)<0){confirmTop = true;}
			if (angleBallABS > angleFront && this.posY-(bats[1].posY+bats[1].batHeight/2)>0){confirmBot = true;}
			//console.log(angleBallABS*(180.0/3.14),angleBall*(180./3.14));

			if (this.posX > (bats[1].posX) && this.posY+this.radius > bats[1].posY && confirmTop){topHit = true;}
			if (this.posX > (bats[1].posX) && this.posY-this.radius < bats[1].posY+bats[1].batHeight && !confirmTop){botHit = true;}
			if (this.posY+this.radius > bats[1].posY && this.posY-this.radius < bats[1].posY+bats[1].batHeight){inRange = true;}
			if (this.posX + this.radius > (bats[1].posX) && inRange && confirmFront){sideHit = true;}
			if (sideHit){
                this.posX = bats[1].posX-this.radius - 1;
                this.aoa = Math.PI - this.aoa;
                this.vx = -this.vx;
				var intersectBall = svg.select('#'+this.id + '_intersect');
				intersectBall.attr('cx', (bats[1].posX+this.posX)/2).attr('cy', this.posY).attr('r', 10).attr('fill', 'red' )
							.transition()
							.duration(500)
							.attr('r', 0);
				//console.log("0 side");
			}else if (topHit){
				this.posY = bats[1].posY - this.radius - 1;
                this.aoa = 2 * Math.PI - this.aoa;
                this.vy = -this.vy;
				console.log("0 top");
			}else if (botHit){
				this.posY = bats[1].posY +bats[1].batHeight + this.radius + 1;
                this.aoa = 2 * Math.PI - this.aoa;
                this.vy = -this.vy;
				console.log("0 bot");
			}			
			
			
            //this.Draw();
        }
    }


    var balls = []; // global array representing balls
	var bats = [];
    var color = d3.scale.category20();

    //courtsey thanks to several internet sites for formulas
    //detect collision, find intersecting point and set new speed+direction for each ball based on weight (weight=radius)

    function Initialize(containerId) {
        var height = document.getElementById(containerId).clientHeight;
        var width = document.getElementById(containerId).clientWidth;
        //gContainerId = containerId;
        //gCanvasId = containerId + '_canvas';
        //gTopGroupId = containerId + '_topGroup';
        var svg = d3.select("#drawArea").append("svg") //+ containerId).append("svg")
         //   .attr("id", gCanvasId)
            .attr("width", width)
            .attr("height", height);
          //  .append("g")
          //  .attr("id", gTopGroupId)
          //  .attr("x", 0)
          //  .attr("y", 0)
          //  .attr("width", width)
          //  .attr("height", height)
          //  .style("fill", "none")
        //.attr("transform", "translate(" + 1 + "," + 1 + ")")
        //;

//        balls.push(new Ball(svg, 501, 101, 'n1', 'red', Math.PI / 6));
//        balls.push(new Ball(svg, 51, 31, 'n2', 'green', Math.PI / 3, 20));
//        balls.push(new Ball(svg, 201, 201, 'n3', 'yellow', Math.PI / 9, 90));
//        balls.push(new Ball(svg, 91, 31, 'n4', 'orange', Math.PI / 2, 15));
//        balls.push(new Ball(svg, 201, 21, 'n5', 'pink', Math.PI + Math.PI / 4, 15));
//        balls.push(new Ball(svg, 401, 41, 'n6', 'blue', Math.PI + Math.PI / 7, 25));
		var x;
		var y;
		var dir;
		var radius = 20;
		var color = d3.scale.category20();
		for (var count = 0; count < 1; ++count){
			x = Math.round(Math.random() * (width - radius * 2) + radius),
			y = Math.round(Math.random() * (height - radius * 2) + radius)
			dir = Math.floor((Math.random() * 10) + 1);
			balls.push(new Ball(svg, x, y, 'n'+count.toString(), color(count), Math.PI / dir,radius));
		}

        for (var i = 0; i < balls.length; ++i) {
            balls[i].Draw();
        }
		var bat_x = 20;
		var bat_y = 20;
		var w = 50;
		var h = 100;
		bats.push(new Bat(svg,bat_x,bat_y,'b0',w,h));
		bats[0].Draw();
		var bat_x = width - w - 20;
		var bat_y = 20;
		bats.push(new Bat(svg,bat_x,bat_y,'b1',w,h));
		bats[1].Draw();
		
        return svg;
    }

    var startStopFlag = null;
    function StartStopGame() {
        if (startStopFlag == null) {
            d3.timer(function () {
                for (var i = 0; i < balls.length; ++i) {
                    var r = balls[i].Move();
					//console.log("positionX",positionX);
					balls[i].Draw();
                }
                if (startStopFlag == null)
                    return true;
                else
                    return false;
            }, 500);
            startStopFlag = 1;
        }
        else {
            startStopFlag = null;
        }
    }
