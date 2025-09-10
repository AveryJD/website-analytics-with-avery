Determining Stanley Cup Contenders From Regular Season Lineups
July 4, 2025
Can a team's overall regular season lineup performance help predict playoff success more than the standings? In this post, I introduce a contender scoring system I built from 17 seasons of NHL data to evaluate which teams had the strongest lineup entering the playoffs. The results show that by looking beyond just the standings, we can uncover stronger indicators of postseason performance and identify teams that are truly built for a Cup run.


### Introduction

With the 2024–2025 season wrapped up and the Stanley Cup being awarded to the Florida Panthers, I thought it would be good to look back on past Cup winners and try to uncover what truly makes a team worthy of hoisting hockey’s greatest prize. Every year, we see teams dominate the regular season only to fall short when the playoffs arrive. For example, the 2022–2023 Boston Bruins finished first overall with the most points in NHL history with a record of 65-12-5 (.823 pts%) but failed to win a single playoff round. We also see some teams barely scrape into the postseason before going on Cinderella runs like the 2020-2021 Montreal Canadiens, who finished 18th overall (0.527 pts%) but managed to go all the way to the final that year. So with all this in mind, is there something we can look at that predicts playoff success more accurately than the regular season standings?

My goal was to devise a system that could score teams based on the overall quality of their entire roster and on-ice performance throughout the regular season to quantify how much of a “true contender” each team really was before the playoffs even began. It should come as no surprise that for a team to survive four intense playoff rounds and capture the Stanley Cup, they need to be strong throughout their entire lineup or at least excel in some areas to make up for deficiencies in others. My aim was to create a formula for a contender score that factors in a team's entire lineup.


### Methodology

For this analysis, I gathered player, goalie, and team data from the past 17 NHL seasons from [Money Puck](https://moneypuck.com/data.htm) and collected the regular season standings data from [Hockey Reference](https://www.hockey-reference.com/leagues/NHL_2025_standings.html). Since my focus was on analyzing playoff contenders, I narrowed the dataset to only include teams that made the playoffs, giving me a total of 272 teams. 

For each team, I broke down the roster into typical positional roles based on games played and average ice time. Specifically, I selected the top 12 forwards, the top 6 defensemen, and the starting goalie by the players who had the most games played by the end of the season. Then I divided the forwards and defensemen into lines based on the players' average ice time. The forwards were divided into four lines of three players, and the defensemen into three pairs of two players, creating four forward groups, three defense groups, and one goaltender for every team. Note that these groups are not meant to represent the actual lines the players were deployed on during games, but rather reflect the players' relative importance to the team over the course of the season.

To evaluate these groups, I used the average game score per game for skaters and average goals saved above expected (GSAx) per game for starting goalies. Game score is a player game evaluation model developed by [Dom Luszczyszyn](https://x.com/domluszczyszyn?lang=en), while GSAx measures a goalie’s performance relative to the quality of shots faced with the model coming from Money Puck. 

Once the data was collected, I calculated the mean and standard deviation of each positional group's stats using the playoff teams as the reference set. These statistical measures formed the basis for my contender score calculation. I calculated each group’s Z-score to standardize their performance relative to playoff team averages, then applied a weight to each score before summing them to compute each team’s overall contender score. When the Z-scores are summed, player groups that performed above average in the regular season saw their contender score rise, while below average groups pulled the score down due to the way the Z-score formula works.

The Z-score for each positional group was calculated as follows:

$$ z = \frac{x - \mu}{\sigma} \times f $$

Where:

- x is the group’s value (Game Score or GSAx)

- μ is the league mean for that group

- σ is the league standard deviation for that group

- f is the weight assigned to the group

- z is the resulting standardized score

The team’s overall Contender Score (CS) is then calculated by summing the Z-scores of all the positional groups:

$$ CS = \sum_{i=1}^{n} z_i$$

To determine the appropriate weight for each group, I used an iterative optimization process inspired by Bayesian methods. The aim was to find the set of weights that produced the most accurate reflection of playoff success, specifically, maximizing the number of Stanley Cup winners who ranked first in contender score, increasing the number of Cup finalists ranked in the top two, conference finalists in the top 4, playoff round winners in the top 8, as well as lowering the average contender score rank of eventual Cup winners.

Now that my contender score calculation is laid out, let's see what factor weights gave the best results, and how well those results were able to rank contenders and compare to the regular season standings.


### Results

Below are the optimal factor weights I arrived at for each positional group:

| Group                  | Weight |
| ---------------------- | ------ |
| 1–3 Forwards           | 4.65   |
| 4–6 Forwards           | 0.05   |
| 7–9 Forwards           | 0.00   |
| 10–12 Forwards         | 4.50   |
| 1–2 Defensemen         | 8.80   |
| 3–4 Defensemen         | 2.00   |
| 5–6 Defensemen         | 9.15   |
| Starting Goalie (GSAx) | 9.75   |

What immediately stands out is how little weight the middle of the lineup (the second and third forward groups and the second defensive pair) carries compared to the top and especially the bottom of the roster. This suggests that the difference between a team that merely qualifies for the playoffs and one capable of making a deep run often lies in two key areas: elite talent at the top and the ability to avoid glaring weaknesses at the bottom. In other words, true contenders don’t just rely on their stars, they also get meaningful contributions from their depth forwards, third-pair defensemen, and consistent goaltending. A weak bottom end can quietly undermine a team’s chances of winning it all.

While the middle of the lineup carries less weight in this model, that doesn’t necessarily mean it isn’t important. Instead, it likely reflects the fact that most playoff calibre teams are able to ice a reasonably competitive middle of the lineup. The bigger differentiators between average playoff teams and true Stanley Cup threats tend to be whether a team has standout stars at the top or exploitable weaknesses in its lower lineup that can be exposed in the postseason.

These weights produced the following performance:

| **Metric**                                    | **Regular Season Standings** | **Contender Score** |
| --------------------------------------------- | :--------------------------: | :-----------------: |
| Teams ranked top 8 that won at least 1 round  |        86/136 (63.24%)       |   86/136 (63.24%)   |
| Teams ranked top 4 that won at least 2 rounds |        23/68 (33.82%)        |    27/68 (39.71%)   |
| Teams ranked top 2 that won at least 3 rounds |         4/34 (11.76%)        |    13/34 (38.24%)   |
| Teams ranked #1 that won the Cup              |         1/17 (5.88%)         |    7/17 (41.18%)    |
| Average rank of Cup winners                   |           6.18               |         4.53        |

Both methods performed similarly when it came to identifying teams likely to win at least one round (top 8), but the contender score pulled ahead as the playoff path deepened. It was significantly better at identifying Cup finalists, conference finalists, and, most notably, actual Cup winners. Seven of the past 17 Stanley Cup winners ranked first in contender score entering the playoffs, compared to just one that ranked first in the regular season standings. 

Additionally, the average contender score rank of Cup winners (4.53) was closer to the top than their average standings rank (6.18). These results suggest that while the standings remain a useful baseline for playoff expectations, the contender score offers a more nuanced and accurate picture, especially when it comes to predicting which teams can go on a true Cup run.

Some more interesting observations:

- The team with the highest points percentage to win the Cup: the 2012-2013 Chicago Blackhawks with 0.802 pts%, ranked 1st in the standings.

- The team with the lowest points percentage to win the Cup: the 2011-2012 Los Angeles Kings with 0.579 pts%, ranked 13th in the standings.

- The team with the highest points percentage that did not win the Cup: the 2022-23 Boston Bruins with 0.823 pts%, ranked 1st in the standings.

- The team with the highest contender score to win the Cup: the 2023-2024 Colorado Avalanche with a score of 51.86, ranked 2nd in the standings.

- The team with the lowest contender score to win the Cup: the 2022-2023 Vegas Golden Knights with a score of -24.77, ranked 4th in the standings.

- The team with the highest contender score that did not win the Cup: the 2020-2021 Colorado Avalanche with a score of 70.11, ranked 2nd in the standings.

These examples serve as reminders that while data can provide valuable insights, hockey remains an unpredictable sport where luck, injuries, and hot goaltending can change everything in an instant.


### Conclusion

Like any model, this methodology comes with its limitations. The biggest challenge is that regular season results don’t always translate cleanly to postseason outcomes. Some players elevate their game when it matters most, while others struggle under the pressure. Playoff teams can look dramatically different from their regular season selves due to factors like injuries, experience, chemistry, and sheer randomness and luck.

For example, in the 2020–2021 season, Tampa Bay Lightning star Nikita Kucherov didn’t play a single regular season game due to injury. Yet he returned for the playoffs, led the postseason in scoring, and helped the Lightning capture their second consecutive Stanley Cup. Tampa still had a very impressive contender score that year, with the team ranking 3rd, but had Kucherov played during the regular season, Tampa's score would no doubt have been higher and possibly 1st. Similarly, in 2022–2023, Vegas captain Mark Stone missed significant regular season time but returned for the playoffs, where the Golden Knights won the Cup despite the team ranking last in contender score that year.

Hockey is, by nature, a volatile sport. The playoffs are influenced not just by talent and structure, but by luck, health, momentum, and timely performances. That said, by accounting for both top-of-the-lineup star power and the strength (or weakness) of depth players, along with goaltending, we can more closely identify the teams that are truly built for a playoff run. While no model can perfectly predict the chaos of the NHL playoffs, I believe the contender score calculation provides a more complete and insightful view than standings alone. I’m looking forward to testing this model on future seasons and refining it as new data emerges.

Credit to [Money Puck](https://moneypuck.com) and [Hockey Reference](https://www.hockey-reference.com) for the data used in this analysis. You can check out the code I wrote for this project and the final contender scores on my [GitHub](https://github.com/AveryJD/NHL-contender-calculation). I hope you enjoyed this analysis. If you have feedback or would like to see more, feel free to reach out or follow along on my [socials](https://analyticswithavery.com/socials).

