// =====================================================
// EDITE AQUI: coloque suas músicas e álbuns
//
// Por faixa (opcional):
//   lyrics — texto da letra
//   about  — inspiração, contexto, bastidores (aparece em "Sobre a música" no app)
// =====================================================

const BAND_NAME = "EchoDome Band"; // ← troque pelo nome da sua banda

const albums = [
  {
    id: "album1",
    name: "Echo",
    year: 2026,
    cover: "assets/img/full-band-logo.jpg", // ← coloque a capa (ou deixe null para emoji)
    coverEmoji: "🎸",               // ← emoji de fallback se não tiver capa
  },
  {
    id: "album2",
    name: "Silent Harmonies",
    year: 2027,
    cover: "/assets/img/album2.png",
    coverEmoji: "",
  }
];

const songs = [
  {
    id: 1,
    title: "Love Story",
    albumId: "album1",
    track: 1,
    file: "assets/music/love-story.mp3", // ← caminho do seu MP3
    duration: "4:05",
    lyrics: `VERSE 1

We were both young when I first saw you
I close my eyes and the flashback starts
You’re standing there
On a balcony in summer air

I see the lights, see the party, the ball gowns
You see me make my way through the crowd
And say: Hello
Little did you know

PRE-CHORUS

That I was Romeo and I were throwing pebbles
And your daddy said: Stay away from Juliet
And you were crying on the staircase
Begging me: Please, don't go

CHORUS

And you said: Romeo, take me somewhere we can be alone
I'll be waiting, all there's left to do is run
You'll be the prince and I'll be the princess
It's a love story, baby, just say yes

VERSE 2

So I sneak out to the garden to see you
We keep quiet 'cause we're dead if they knew
So close your eyes
Escape this town for a little while, uh, oh

PRE-CHORUS

'Cause I was Romeo, you were a scarlet letter
And your daddy said: Stay away from Juliet
But you were everything to me
You were begging me: Please, don't go

CHORUS

And I said: Juliet, I take you somewhere we can be alone
Just keep waiting, all there's left to do is run
I'll be the prince and you'll be the princess
It's a love story, baby, just say yes

VERSE 3

Romeo, save me, they're trying to tell me how to feel
This love is difficult, but it's real
Don't be afraid, we'll make it out of this mess
It's a love story, baby, just say yes
Oh, oh

BRIDGE

I got tired of waiting
Wondering if you were ever coming around
My faith in you was fading
When I met you on the outskirts of town

You said: Romeo, save me, I've been feeling so alone
I keep waiting for you, but you never come
Is this in my head? I don't know what to think
I knelt to the ground, pulled out a ring

OUTRO

And said: Marry me, Juliet, you'll never have to be alone
I love you and that's all I really know
I talked to your dad, go pick out a white dress
It's a love story, baby, just say yes

Oh, oh, oh
Oh, oh, oh, oh
'Cause we were both young when I first saw you`,
    about: `Antes da banda, Trace costumava tocar músicas que não eram dele.
Algumas ficaram presas na memória — intactas demais para desaparecer.
“Love Story” foi uma delas.
Regravar não foi uma escolha estética.
Foi uma tentativa de entender por que certas histórias continuam existindo, mesmo depois de tudo mudar.
Essa versão não tenta ser fiel.
Só tenta ser verdadeira dentro do que restou dele.`
  },
  {
    id: 2,
    title: "Between The Lines",
    albumId: "album1",
    track: 2,
    file: "assets/music/between-the-lines.mp3",
    duration: "4:30",
    lyrics: `VERSE 1

It’s 2 a.m. again.
I’m awake.
Not because I want to be.
Just… thinking.
About everything I have to hold together.
About how I don’t remember
the last time I felt light.
I don’t say that out loud.
I just carry it.

VERSE 2

I’ve learned how to function tired.
How to smile on low battery.
How to answer “I’m good”
without meaning it.
It’s not a lie.
It’s just easier.

PRE-CHORUS

Sometimes I wonder
if anyone would notice
how close I am
to empty.
Not broken.
Just… worn.

CHORUS

I’m still moving.
Still doing what I’m supposed to do.
But somewhere between responsibility
and expectation
I misplaced something that felt like me.
I’m not asking to escape.
I’m not asking for less.
I just wish
being strong
didn’t feel like disappearing.

VERSE 3

There’s a younger version of me
that still knocks sometimes.
He asks if we’re happy.
If we’re trying.
If we remember what we wanted.
I tell him
“Not now.”
And I hate that answer.

BRIDGE

I don’t want to quit.
I don’t want to run.
I just don’t want to wake up
one day
and realize
I survived everything
but never lived.

OUTRO

I’m still here.
Still holding it all together.
I just hope
there’s still something of me
between the lines.`,
    about: `Durante um período em que a banda não se encontrava, TRACE continuou compondo sozinho.
As gravações dessa música começaram sem intenção de se tornarem uma faixa.
Eram fragmentos — ideias soltas, pensamentos repetidos.
LYRA foi a primeira a ouvir. Disse que não era uma música.
Era um estado.
A banda decidiu não polir demais.
Algumas coisas não precisam soar perfeitas.
Só precisam existir.`
  },
  {
    id: 3,
    title: "Eu Não Queria Sentir Assim",
    albumId: "album1",
    track: 3,
    file: "assets/music/eu-nao-queria-sentir-assim.mp3",
    duration: "4:15",
    lyrics: `VERSE 1

Eu não queria sentir assim
Era só mais um rosto na multidão
Mas quando você olhou pra mim
Alguma coisa saiu do controle da minha razão
Eu tentei fingir que era normal
Que era só coisa da minha cabeça
Mas toda vez que você passava
Meu mundo inteiro desaparecia

PRÉ-REFRÃO

Eu tento me esconder
Mas meus olhos me traem
Tudo que eu calei
Começa a gritar
REFRÃO – EXPLOSIVO

Seu olhar me atravessa
Me desmonta por dentro
Eu perco o ar
Eu perco o centro
Eu tentei resistir
Mas não dá pra negar
Quando você me olha assim
Eu deixo tudo desabar

VERSO 2

Eu me construí pra não sentir
Levantei muros pra me proteger
Mas você passa por cada um deles
Sem nem perceber
E eu odeio admitir
Que preciso de você aqui
Porque quando você não está
Parece que eu deixo de existir

PRÉ-REFRÃO

Eu finjo não ligar
Mas meu silêncio entrega
Cada batida do meu peito
Chamando por você

REFRÃO

Seu olhar me atravessa
Rasga tudo que eu sou
Me tira do escuro
Que eu mesmo criei ao redor
Eu tentei resistir
Mas não dá pra fugir
Quando você me olha assim
Eu começo a ruir

PONTE

Eu lutei contra isso
Eu neguei, eu fingi
Mas quanto mais eu me escondo
Mais eu corro pra ti
Se amar é perder o controle
Então eu já perdi
Se isso é fraqueza
Então eu escolhi

ÚLTIMO REFRÃO

Seu olhar me atravessa
E eu não quero escapar
Se for pra me quebrar por dentro
Que seja pra me transformar
Quando você me olha assim
Não existe mais chão
Só o som do meu peito
Explodindo em suas mãos`,
    about: `Durante os primeiros ensaios dessa música, TRACE parava no meio das gravações.
Não por erro técnico.
Por hesitação.
OD dizia que a música estava “exposta demais”.
EMBER queria acelerar tudo, transformar em impacto.
LYRA foi a única que não pediu mudança.
Disse que aquela era a primeira vez que algo soava… real demais pra ser controlado.
A banda decidiu manter assim.
Imperfeito. Instável.
Como deveria ser.`
  },
  {
    id: 4,
    title: "Echoes Of Yesterday",
    albumId: "album1",
    track: 4,
    file: "assets/music/echos.mp3",
    duration: "4:22",
    lyrics: `VERSE

    The photographs are fading on my wall,
    Names I can't recall in the shadows fall.
    Classrooms hum with voices I once knew,
    Laughter in the air that never rang true.

    
PRE-CHORUS

    Time rewinds like whispers down the hall,
    Footsteps echo but they never call.
    Was I ever really part of the scene?    
    Or just a ghost in someone else's dream?

    
CHORUS

    Oh, the echoes of yesterday are slipping through my hands,
    Like castles built on shifting sands.
    We were chapters in a book never read,
    Now the ink has bled, the words are dead.

    
VERSE

    Desk carvings fade with every passing spring,
    Promises we made don't mean a thing.
    Reunions pass like strangers in the night,
    No wrongs to right, no flames to light.

    
PRE-CHORUS

    Yearbooks gather dust upon the shelf,
    Memories I keep but can't reclaim myself.
    Did we ever really share the same sky?
    Or was I just learning how to say goodbye?

    
CHORUS

    Oh, the echoes of yesterday are slipping through my hands,
    Like castles built on shifting sands.
    We were chapters in a book never read,
    Now the ink has bled, the words are dead.
    
    
CHORUS

    Oh, the echoes of yesterday are slipping through my hands,
    Like castles built on shifting sands.
    We were chapters in a book never read,
    Now the ink has bled, the words are dead.

    
CHORUS

    Oh, the echoes of yesterday are slipping through my hands,
    Like castles built on shifting sands.
    We were chapters in a book never read,
    Now the ink has bled, the words are dead.`,
    about: `Durante a produção dessa música, TRACE trouxe referências que ninguém na banda reconhecia.
Lugares, nomes, situações — tudo parecia distante, como se viesse de outra versão dele.
DUSK disse que soava como memória… mas sem peso.
LYRA descreveu como “lembrar de um sonho depois que ele já perdeu o sentido.”
A banda decidiu não preencher as lacunas.
Algumas memórias não falham por acidente.
Elas se apagam porque nunca foram sólidas o suficiente para permanecer.`
  },

  {
    id: 5,
    title: "I Feel Stuck",
    albumId: "album1",
    track: 5,
    file: "assets/music/i-feel-stuck.mp3",
    duration: "4:20",
    lyrics: `VERSE 1

I feel stuck
Face down on the floor
I want to change
But I don’t know what for
I try to follow my dream
But I never wrote it down
Time moves faster than me
And I’m still spinning around
Then I ask myself, “What now?”
But the silence is too loud

PRE-CHORUS

Every second that I waste
Feels like I’m fading away
I’m tired of living the same
On repeat every day

CHORUS

Happiness is not a goal
It’s the journey that you take
If I don’t start moving now
My whole life will be fake
I don’t want to be
Another victim of doubt
Just another lost soul
In the lost dreams town

VERSE 2

I built walls out of fear
Called it “playing safe”
Watched my years disappear
While I learned how to wait
I kept saying “someday”
Like it’s coming for free
But someday never shows
If it’s up to me

PRE-CHORUS

Every chance that I ignore
Turns into regret
I’m done with standing still
I’m not finished yet

CHORUS

Happiness is not a goal
It’s the fire in your veins
If I don’t chase it now
I’ve got no one else to blame
I don’t want to be
Another name worn down
Just another broken voice
In the lost dreams town

BRIDGE

What if I fail?
What if I fall?
What if I’m not enough at all?
But what if I fly?
What if I try?
What if this fear is just a lie?

FINAL CHORUS

Happiness is not a goal
It’s every step you make
And I’d rather fall chasing truth
Than live a life that’s fake
I won’t be
Another victim of doubt
I’m breaking out right now
From this lost dreams town`,
    about:`Essa foi uma das poucas músicas em que TRACE não parou no meio.
Não porque estava fácil —
mas porque ele não queria dar espaço para dúvida.
EMBER acelerou a base, empurrando a música pra frente.
OD manteve a tensão, sem aliviar o peso.
DUSK segurou o pulso, constante, como algo que não pode parar.
LYRA adicionou camadas que não resolvem —
só acompanham.
A banda descreve essa faixa como um impulso.
Não um destino.
Só o início de movimento.`
  },
  {
    id: 6,
    title: "Nunca Es Suficiente",
    albumId: "album1",
    track: 6,
    file: "assets/music/nunca-es-suficiente.mp3",
    duration: "3:25",
    lyrics: `Verso 1

    Me levanto antes del sol
Con mil preguntas y ningún control
Intento hacerlo todo perfecto
Pero siempre señalan el defecto
Cargo el día sobre mi piel
Tragando todo sin responder
Y cuando vuelvo buscando paz
Solo escucho lo que hice mal

Pre-Chorus

Corro, intento, vuelvo a empezar
Pero nada logra alcanzar
Lo que esperan de mí
Nunca es así

Chorus

Estoy cansado de intentarlo todo
Y escuchar que no es suficiente
¿Fue un mal día nada más
O cinco minutos en mi mente?
Si fallo una vez, lo repito otra vez
Como si fuera permanente
¿Un segundo borra lo demás?
¿Nada de lo bueno cuenta realmente?
Nunca es suficiente para ti

Verso 2

Mi silencio ahora es error
Mi cansancio falta de valor
Si respiro para no caer
Dicen que tengo que correr
Doy lo poco que queda en mí
Hasta sentir que me perdí
Pero siempre hay algo más
Siempre falta algo más

Pre-Chorus

Intento ser fuerte sin descansar
Pero nadie me quiere escuchar
Coro (más intenso)
Estoy cansado de intentarlo todo
Y escuchar que no es suficiente
¿Fue un mal día nada más
O cinco minutos en mi mente?
Si fallo una vez, lo repito otra vez
Como si fuera permanente
¿Un segundo borra lo demás?
¿Nada de lo bueno cuenta realmente?
Nunca es suficiente

Bridge

No soy máquina, soy humano
No soy hierro, tengo daño
Si me rompo es de verdad
No es debilidad

No soy solo mis errores
No soy solo presión
Si sigo aquí respirando
Es porque tengo corazón

Last Chorus

Estoy cansado — pero sigo de pie
Aunque me digan que no va a cambiar
Si fueron cinco minutos malos
¿Por qué me dejo condenar?
Nunca es suficiente para ti
Pero empieza a ser suficiente para mí`,
    about:`Durante os ensaios, essa foi uma das músicas mais intensas da banda.
EMBER levou tudo ao limite — mais rápido, mais forte, sem espaço para respirar.
OD reforçou o peso, quase sufocando a melodia.
DUSK manteve o pulso constante, como pressão que não diminui.
LYRA adicionou camadas densas, criando a sensação de algo sempre acumulando.
TRACE não suavizou nada.
A banda decidiu não aliviar a carga.
Porque essa música não pede conforto.
Ela expõe o peso de tentar ser tudo ao mesmo tempo —
e ainda assim não ser suficiente.`
  },
  {
    id: 7,
    title: "What If",
    albumId: "album1",
    track: 7,
    file: "assets/music/what-if.mp3",
    duration: "4:59",
    lyrics: `Verse 1

    Sometimes your name comes back
Like a city I never saw
Ten years living different lives
Still wondering what I lost
It’s not that I want to go back
Or tear apart what I built
But some nights ask me softly
Who I’d be without this guilt

Pre-Chorus

It’s not love calling me
It’s the road I never chose
A message left unsent
A door I never closed

Chorus

What if we had tried?
What if I had stayed?
Would we be strangers now
Or something we never named?
What if I took that plane
Drove four hundred miles for you?
It’s not that I want another life
I just wonder who I’d be… if I had followed through

Verse 2

There was someone amazing
But I didn’t know how to see
I was young and disillusioned
Too afraid to believe
Now I have a home, a child
Stability I can’t deny
But there are versions of me
Still living in those “goodbye”s

Pre-Chorus

It’s not desire — it’s memory
It’s curiosity

Bridge

Maybe it wasn’t destiny
Maybe it was fear
Maybe love was in my hands
But I just disappeared
Maybe we’d be broken
Maybe we’d be fine
Maybe happiness was never there
Just a story in my mind

Final Chorus 

What if I had tried?
What if I was brave?
Maybe I wouldn’t be happier
Just different than today
I don’t want to rewrite my life
Or undo what I’ve become
I just sometimes miss
The man I might have been…
Before I learned to run`,
    about:`Trace descreveu essa música como “um pensamento que voltou tarde demais”.
Não há urgência nela.
Não há erro a corrigir.
Apenas a percepção de que algumas escolhas não deixam cicatriz —
deixam ausência.
LYRA disse que essa faixa não soa triste.
Soa distante.
Como olhar para uma vida que nunca aconteceu…
e aceitar que ela nunca vai acontecer.`
  },
  {
    id: 8,
    title: "The Boy I Was",
    albumId: "album1",
    track: 8,
    file: "assets/music/the-boy-i-was.mp3",
    duration: "4:49",
    lyrics: `Verse 1

    I found a picture of you today
Skinny arms and reckless faith
You thought the world was wide and kind
You didn’t know what it could take
You wore your heart outside your chest
Like armor made of glass
You thought that love would save you
You didn’t think it’d pass

Pre-Chorus

You swore you’d never lose yourself
You swore you’d never run
You had a fire inside your lungs
You thought you were the only one

Chorus

Hey, boy I was
You don’t know what’s coming
You don’t know how much you’ll bend
You’ll lose some fights
You’ll lose some friends
But you survive
More than you think you could
You’re not as weak
As you misunderstood
Hold on to that fire
Don’t let it go
I’m still trying to be you
More than you know

Verse 2

You thought distance meant the end
You thought heartbreak meant you failed
You didn’t see the bigger road
You couldn’t read the trails
You were chasing every “what if”
Like it held the cure
But growing up just means
Learning nothing’s ever pure

Pre-Chorus

You’ll build a life you never planned
You’ll love deeper than you knew
You’ll question every step you take
But you’ll still be you

Chorus

Hey, boy I was
You don’t know what’s coming
You don’t know how strong you’ll get
From all the things you’re running
You survive
Even when it hurts
You’ll find a home
Even through the worst
Hold on to that fire
Even when it’s hard
I’m still trying to carry
That fearless heart

Bridge

Hey…
I know you think you’re behind.
Like everyone else is moving faster.
Like you missed something.
You didn’t.
You think that if she leaves,
it means you weren’t enough.
It doesn’t.
You think every mistake defines you.
That every “almost” is a failure.
It’s not.
You’re going to love again.
You’re going to build something real.
You’re going to become someone
you don’t even recognize yet.
And yeah…
you’re going to doubt yourself.
A lot.
But listen to me —
You survive things
you don’t even know are coming.
And one day
you’ll look back at this version of you
and realize…
He was braver than he thought.
Don’t lose that fire.
I’m still trying to carry it.

Final Chorus

Hey, boy I was
You’d be proud of where we are
It’s not the dream you pictured
But it’s honest — and it’s ours
We didn’t get it perfect
We didn’t get it right
But we kept going
Every single night
Hold on to that fire
I finally know
You were stronger
Than you ever thought you’d be
And you saved me
More than you know`,
    about:`Durante a produção dessa música, TRACE evitou regravar os primeiros takes.
Pequenas falhas, respirações, imperfeições — tudo foi mantido.
LYRA descreveu como “uma resposta atrasada”.
DUSK disse que soava diferente de tudo que a banda já tinha feito.
Não mais pesado.
Mais honesto.
A banda não tentou intensificar essa faixa.
Algumas coisas não precisam crescer.
Só precisam ser ditas.`
  },
  {
    id: 9,
    title: "After Everyone Sleeps",
    albumId: "album2",
    track: 9,
    file: "assets/music/after-everyone-sleeps.mp3",
    duration: "4:29",
    lyrics: `Verse 1

    The house goes quiet after midnight
Footsteps fade down the hall
Toys on the floor like small reminders
Of a life I built through it all
The TV glow is slowly dying
Shadows stretch across the room
And for a moment there’s no noise
Just breathing in the gloom

Pre-Chorus

All day I carry everything
Like nothing’s breaking me
But when the silence finally comes
The truth starts speaking free

Chorus

After everyone sleeps
And the world finally slows
All the thoughts I buried
Are the ones that come and go
In the quiet of the dark
When there’s nowhere left to hide
I meet the man I really am
When there’s no one by my side

Verse 2

Your tiny shoes beside the doorway
A jacket hanging on the chair
Proof that somehow through the chaos
Love is living everywhere
And though the weight is always heavy
There’s a peace I can’t deny
In the fragile little moments
That the daylight passes by

Pre-Chorus

All day I’m trying to be the rock
The one who never breaks
But midnight knows the truth inside
Of every breath I take

Chorus

After everyone sleeps
And the world finally slows
All the fears I’m hiding
Are the ones nobody knows
In the quiet of the dark
Where the questions come alive
I meet the man I’m becoming
Somewhere deep inside

Bridge

Maybe strength is just surviving
Every doubt inside my head
Maybe love is just the promise
That I’ll rise from every dread

Final Chorus

After everyone sleeps
And the silence fills the air
I realize the life I feared
Is the one I’m building here
And though the night can feel so deep
And the road feels steep to climb
In the quiet I remember
This fragile life is mine`,
    about:`Durante esse período, TRACE já não escrevia mais sobre perda ou ruptura.
A vida ao redor dele era concreta.
Presente. Real.
Pequenos detalhes começaram a aparecer nas gravações — sons mais contidos, espaços maiores entre as notas.
DUSK descreveu como “peso que não machuca, mas nunca sai”.
LYRA chamou de “silêncio cheio”.
A banda não tentou transformar essa música em algo maior do que ela é.
Porque ela não fala de extremos.
Fala do que fica.`
  },
  {
    id: 10,
    title: "Somewhere Between Us",
    albumId: "album2",
    track: 10,
    file: "assets/music/somewhere-between-us.mp3",
    duration: "4:34",
    lyrics: `Verse 1
You say it softly, almost kind
“Maybe try it this way instead”
Like every little difference
Is a thread that needs to mend
I nod and shift a little closer
To the shape you’re drawing out
And every quiet compromise
Feels smaller than the doubt
        
      Pre-Chorus
It’s never really fighting
Just a thousand tiny turns
Until the road I thought was mine
Looks different than I learned

      Chorus
Somewhere between your way and mine
Something slowly disappeared
Not in anger, not in noise
Just in things we never cleared
I kept moving toward your side
Every time we disagreed
Now I’m standing in the middle
Wondering which of us is me

      Verse 2
You always say it gently
Like you're only trying to care
But every “better option”
Leaves a quiet in the air
And maybe you don’t notice
How the balance slowly bends
When one voice guides the compass
And the other just pretends

      Pre-Chorus
It’s never really breaking
Just a slow and careful drift
Like a house that’s still standing
But the ground begins to shift

      Chorus
Somewhere between your way and mine
Something slowly faded out
Not a door slammed in the dark
Just the shadow of a doubt
I kept giving up the edge
Of the things I used to be
Now I’m standing in the silence
Trying to remember me
    
      Bridge
Maybe love isn’t control
Maybe love is letting bend
Maybe two imperfect roads
Are where the real ones start to blend

      Final Chorus
Somewhere between your way and mine
Maybe we can start again
Not with one voice leading all
But with both of us as friends
Because love was never meant
To redraw who we could be
It was meant to build a place
Where both of us stay free`,
    about:`Durante os ensaios, essa foi uma das músicas mais contidas da banda.
Não por falta de intensidade —
mas por precisão.
EMBER segurou o impacto, evitando explosões óbvias.
OD reduziu o peso, deixando espaço entre as notas.
DUSK manteve tudo estável, quase imóvel.
LYRA construiu camadas sutis, como algo que cresce sem ser notado.
TRACE não elevou a voz.
Porque essa música não fala de ruptura.
Fala do que acontece antes dela.`
  },
  {
    id: 11,
    title: "Letters I've Never Send",
    albumId: "album2",
    track: 11,
    file: "assets/music/letters-i-ve-never-send.mp3",
    duration: "4:34",
    lyrics: `Verse 1
If you’re reading this someday
It means I finally found the words
The ones I should have said before
But somehow never learned
Life moves faster than we notice
And years pass in a breath
So many things we carry quiet
Until there’s nothing left

      Chorus
These are the letters I never sent
The thank you’s left unsaid
For every hand that lifted mine
When hope was hanging by a thread
If I never said it clearly
If I never spoke it then
Just know this life I built
Was shaped by you, my friends

      Verse 2
To the ones I called my parents
You gave more than I could see
Long before I understood
What sacrifice could be
You held the world together
In ways I never knew
And every good thing in my life
Still somehow leads to you

      Verse 3
And to the man who wasn’t my father
But showed me how to stand
You never asked for credit
You just offered me your hand
You taught me strength is quiet
And respect is something earned
Some of the best lessons of my life
Came from watching how you lived

      Chorus
These are the letters I never sent
The words I meant to say
For every light you left for me
That helped me find my way
If time was something endless
I’d say this all again
But life is short and fragile
So I’m writing it like this

      Bridge
If this letter finds you someday
I hope it makes you smile
Because everything you gave to me
Stayed with me all the while

    Final Chorus
These are the letters I never sent
But maybe now they arrive
To thank you for the love you gave
That helped me build this life
And if my voice is fading
Like the ending of a song
Just know the best of who I was
Was yours all along`
  },
  {
    id: 12,
    title: "Te Voy A Cambiar",
    albumId: "album2",
    track: 12,
    file: "assets/music/te-voy-a-cambiar.mp3",
    duration: "4:35",
    lyrics: `VERSO 1
Siempre hay dos reglas en tu voz
una para mí, otra para los dos
Si fallo un paso soy el peor
si tú lo haces, cambia el color

Dices que nunca sé amar
que todo lo hago siempre mal
pero si miras bien atrás
verás quién nunca se quiso marchar

      PRE-CORO
Y cada vez que algo no sale como quieres tú
vuelves a decir lo mismo otra vez

      CORO
Si lo hago yo, está mal
si lo haces tú, está bien
dos medidas para juzgar
lo mismo que hicimos ayer

Siempre escucho la misma amenaza
“te voy a cambiar por alguien mejor”
como si el amor fuera tan fácil
como cambiar un nombre por otro

      VERSO 2
Si no hice todo como esperabas ver
dices que otro lo haría mejor
que algún día vas a elegir
otro hombre que ocupe mi lugar

Que incluso podrías buscar
otro padre para nuestro hijo
como si una vida entera
se cambiara solo por orgullo

      PRE-CORO
Y esas palabras caen una y otra vez
como si ya no pesaran después

      CORO
Si lo hago yo, está mal
si lo haces tú, está bien
tu balanza siempre decide
que el culpable debo ser

Y escucho otra vez la amenaza
“te voy a cambiar por alguien mejor”
pero el amor no es reemplazar
lo que se dio con el corazón

      PUENTE
Pero escucha bien esta vez
porque algo empezó a cambiar
de tanto oír esas palabras
un día me voy a cansar

Porque nadie puede vivir
siendo siempre el malo del lugar
si todo lo que hago está mal
entonces prefiero marchar

      BREAK
Y no sirve que después te rías
y actúes como si nada pasó
las palabras no se borran
solo porque cambió el tono de tu voz

Porque quien hiere de verdad
sabe muy bien lo que hace
y aunque intente disimular
la herida nunca se deshace

      CORO FINAL
Si lo hago yo, está mal
si lo haces tú, está bien
pero nadie puede vivir
siempre siendo el que pierde

Y si un día decido partir
no será por falta de amor
será porque me cansé
de ser siempre el peor`
  },
  {
    id: 13,
    title: "Depois Das 2 Da Manhã",
    albumId: "album2",
    track: 13,
    file: "assets/music/depois-das-duas-da-manha.mp3",
    duration: "3:33",
    lyrics: `[Verso 1]
Depois das duas da manhã
não tem silêncio que me acalme não
é só barulho na cabeça
e um copo vazio na mão

fico lembrando das histórias
que eu deixei pra depois
e agora só me resta pensar
no que não aconteceu de nós dois

      [Refrão]
E se eu tivesse ido te ver?
E se eu tivesse dito o que eu quis?
Vai saber se dava certo
ou se ia ser pior do que isso aqui

E se eu tivesse arriscado mais?
E se eu tivesse sido outro cara?
talvez eu tava em outro lugar
ou só com outro problema na cara

      [Verso 2]
Quase peguei aquela estrada
quase parei na tua porta
mas na hora deu aquele medo
e eu virei as costas

um amor pela tela
prometendo ser real
acabou virando história
dessas que terminam mal

      [Refrão]
E se eu tivesse ido te ver?
E se eu tivesse dito o que eu quis?
Vai saber se dava certo
ou se ia ser pior do que isso aqui

      [Ponte]
No fim das contas é sempre assim
a gente perde sem nem jogar
fica inventando outro destino
pra não ter que aceitar

      [Final]
Depois das duas da manhã
eu já nem sei mais o que pensar
porque esses “e se” não servem pra nada
e não vão me fazer voltar`
  },
  {
    id: 14,
    title: "Até Onde Vale",
    albumId: "album2",
    track: 14,
    file: "assets/music/ate-onde-vale.mp3",
    duration: "3:51",
    lyrics: `(verso 1)
Mais um dia que pesa mais que ontem
O corpo anda, mas a mente já ficou
Cada passo soa como um erro repetido
E o silêncio grita tudo que eu não sou

      (verso 2)
Eu conto o tempo em pequenas derrotas
Promessas que eu não consegui cumprir
E no espelho tem alguém que eu não reconheço
Tentando, mas cansado de insistir

      (pré-refrão)
Quanto disso é força
E quanto é só medo de parar?
Eu já nem sei direito
Se ainda faz sentido continuar

      (refrão)
Até onde vale aguentar calado?
Até onde é força ou só teimosia?
Se cada dia custa um pedaço meu
E eu nem sei se isso ainda é vida

Eu tô no limite faz tempo demais
Mas ninguém vê o que ficou pra trás
E o que me quebra não faz barulho
Só me ensina a desistir em silêncio

      (verso 3)
Tem dias que o ar pesa no peito
E respirar parece negociação
Entre o pouco que ainda me sustenta
E o muito que me puxa pro chão

      (pré-refrão)
Se eu soltar agora
Será que alguém vai perceber?
Ou só mais um cansaço
Que aprenderam a não ver

      (refrão)
Até onde vale aguentar calado?
Até onde é força ou só teimosia?
Se cada dia custa um pedaço meu
E eu nem sei se isso ainda é vida

Eu tô no limite faz tempo demais
Mas ninguém vê o que ficou pra trás
E o que me quebra não faz barulho
Só me ensina a desistir...

    (ponte)
E se não for fraqueza parar?
E se for coragem escolher
Não se perder inteiro
Só pra continuar sendo alguém
Que eu nem quero mais ser

      (refrão final)
Talvez não seja sobre aguentar tudo
Talvez seja saber soltar
Antes que sobre só o vazio
Do que eu tentei salvar

Até onde vale ir sozinho
Carregando o que ninguém vê?
Se ficar custa tudo de mim
Talvez ir seja me manter

      (final)
Eu ainda tô aqui…
Mas já não sei até quando isso é viver
`
  },
  {
    id: 15,
    title: "Vozes Em Mim",
    albumId: "album2",
    track: 16,
    file: "assets/music/vozes-em-mim.mp3",
    duration: "3:15",
    lyrics: `(verso 1)
Eu sei exatamente onde isso vai dar
Mais uma volta no mesmo lugar
Promessas quebradas no meio do caminho
Eu já tô cansado de lutar sozinho

Eu já tentei, você sabe que sim
Mas sempre termina igual pra mim
Cê fala em força, eu só vejo o fim
Talvez parar seja melhor assim

      (verso 2)
Não vem com isso, eu te conheço bem
Você já disse isso mais de cem
E mesmo quebrado, você levantou
Mesmo sem nada, você continuou

Você esquece tudo que venceu
Cada pedaço que não se perdeu
Se ainda dói, é porque não morreu
Tem algo em você que não cedeu

      (pré-refrão)
— Então por que dói tanto assim?
— Porque você nunca deixou de sentir
— E até quando eu vou insistir?
— Até não precisar mais fugir

      (refrão)
Duas vozes gritando dentro de mim
Uma quer parar, outra diz “vai até o fim”
Se eu me escuto, eu me quebro mais
Se eu te ignoro, eu não sei do que sou capaz

Eu tô dividido sem saber quem eu sou
Entre o que cansou e o que ainda restou
Se desistir me traz paz no final
Ou se continuar me destrói igual

        (verso 3)
— Você tá perdendo o controle já faz tempo
— Ou talvez seja a primeira vez que eu tento
— Não dá pra carregar tudo isso sozinho
— Mas também não dá pra largar no caminho

      (pré-refrão 2)
— E se eu cair?
— Eu te levanto
— E se eu quebrar?
— Eu junto os pedaços

      (refrão)
Duas vozes gritando dentro de mim
Uma quer parar, outra diz “vai até o fim”
Se eu me escuto, eu me quebro mais
Se eu te ignoro, eu não sei do que sou capaz

       (ponte)
E se nenhuma das duas estiver errada?
E se sentir isso for parte da estrada?
Talvez não seja sobre vencer a dor
Mas não deixar ela decidir quem eu sou

      (refrão final)
Duas vozes… e eu no meio delas
Tentando não me perder nelas
Se continuar é o que me mantém
Então eu sigo… mesmo sem saber também

      (final)
Eu não silenciei nenhuma voz…
Só aprendi a viver com nós dois
`
  },
];