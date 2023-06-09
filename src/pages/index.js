import React, { useEffect, useRef, useState } from 'react';
import style from "../styles/Home.module.css";
import Image from 'next/image';
import { IoIosArrowDropright } from 'react-icons/io';
// import { CiLocationArrow1 } from 'react-icons/ci';


export async function getServerSideProps({ req }) {
  const protocol = process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? 'https' : 'http';
  const currentHost = req.headers.host;
  const server = `${protocol}://${currentHost}`;
  return {
    props: {
      server,
    },
  };
}



const fetchDatas = async ( server ) => {
  try {
    const res = await fetch(`${server}/data/info.json`);
    const data = await res.json();
    return data
  }
  catch(err) {
    console.log(err);
  }
};

function Home({ server }) {
  const myRef = useRef(null);

  const [ number, setNumber ] = useState('');
  const [ language, setLanguage ] = useState('');
  const [ num, setNum ] = useState(1)
  const [ lang, setLang ] = useState('English')
  const [ userInput, setUserInput] = useState(null);
  const [ adv, setAdv ] = useState('too');
  const [ msg, setMsg ] = useState(null);
  const [ parsedResponse, setparsedResponse ] = useState(null);
  const [ cssFlag, setCssFlag ] = useState(true);
  const [ sendFlag, setSendFlag ] = useState(true);

  useEffect(()=>{
    const gettingData = async() => {
      const data = await fetchDatas(server);
      setLanguage(data.languages);
      setNumber(data.numbers);
    }
    gettingData();
  },[]);

  const scrollToRef = () => window.scrollTo({
    top: myRef.current.offsetTop,
    behavior: "smooth"
  })


  const runPrompt = async (e) => {
    e.preventDefault();
    if(userInput !== null && userInput !== ''){
      setSendFlag(false)
      setMsg(null);
      const sendData = 
        {
          'word': userInput,
          'adv': adv,
          'num': num,
          'lang': lang
        }
      
      const response = await fetch(`${server}/api/hello`, {
        method: 'POST',
        body:  JSON.stringify(sendData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response?.status !== 200) {
        const data = await response.json();
        
        setMsg(data?.message);
        setparsedResponse(null);
        setUserInput(null);
      } else {
        const data = await response.json();
        setparsedResponse(data);
        if(data.length > 4){
          setCssFlag(false);
        }else{
          setCssFlag(true)
        }
        setMsg(null);
        setSendFlag(true);
      }
    }else{
      setMsg('Write your adjective');
    }
    
  };
  
  return (
    <div className={ style.body }>
      <figure className={style.figure}>
        <Image
        src='/imgs/logo_Vocamate.jpeg'
        alt='logo icon'
        className={ style.img } 
        width={200}
        height={100}
      />
        <p>Let&apos;s find new vocabulary</p>
        <form onSubmit={(e)=>runPrompt(e)} className={ style.formClass }>
            <div onClick={scrollToRef}>Examples?
              <IoIosArrowDropright className={ style.examp__icon }/>
            </div>
            <div>
              <label htmlFor='language'>
                Which language in answer?
              </label>
              <select onChange={(e)=>setLang(e.target.value)} name='language' value={lang}>
                { language && language.map((lan) =>{
                  return (
                    <option key={lan} value={lan}>{lan}</option>
                  )
                })}
              </select>
            </div>
            <div>
              <label htmlFor='number'>
                How many examples?
              </label>
              <select onChange={(e)=>setNum(e.target.value)} name='number' value={num}>
              {number && number.map((numb) =>{
                return (
                  <option key={numb} value={numb}>{numb}</option>
                  )
                })}
              </select>
            </div>
            <div className={  style.initial__word}>
              <div className={ style.user__input }>
                <select onChange={(e)=>setAdv(e.target.value)}>
                  <option value='too'>Too</option>
                  <option value='very'>Very</option>
                </select>
                <input placeholder='write your adjective' type='text' onChange={(e)=>setUserInput(e.target.value)}/>
              </div>
              <div className={ style.submit__button }>
                { sendFlag ?
                <button type='submit'>Convert</button>
                :
                <h2>Converting...</h2>
                }
              </div>
            </div>
            <p>{msg}</p>
            <details>
              <summary>
              What&apos;s the difference is Too and Very?
              </summary>
              
              <small>
              &quot;Too&quot; means excessive or beyond desirable, while &quot;very&quot; means high degree or intensity. &quot;Too&quot; has negative consequence, &quot;very&quot; emphasizes intensity. 
              </small>
            </details>
        </form>
      </figure>
      <div ref={myRef} className={ style.mainClass }>
        
        <div className={ style.synonyms }>
        { parsedResponse ? (
            <div className={ cssFlag ? style.synonyms : style.adjust__synonyms}>
            <div className={ cssFlag ? style.exampTitle : style.adjust__exampTitle }>
              <h4>Synonyms</h4>
            </div>
            { parsedResponse.map((res)=>{
               return (
                 <div className={ cssFlag ? style.synonym : style.adjust__synonym } key={res.index}>
                   <h2>{res.word}</h2>
                   <ul>
                    <li>{res.meaning[0]}</li>
                    <li>{res.meaning[1]}</li>
                   </ul>
                 </div>
               )
             }) }
          </div>
        )
          : parsedResponse === false ?
          <div className={ style.synonyms }>
            { msg }
          </div>
          :
          <div className={ style.synonyms }>
            <div className={ style.exampTitle }>
              <h3>Synonyms</h3>
              <p><span>Examples:</span>Too &quot;Hot&quot;</p>
            </div>
            <div className={ style.synonym }>
                   <h2>Scorching</h2>
                   <ul>
                    <li>Extremely hot and uncomfortable</li>
                   <li>Having a bright red-orange &hellip;</li>
                   </ul>
                
            </div>
            <div className={ style.synonym }>
                   <h2>Blazing</h2>
                   <ul>
                    <li>Very hot,often referring to the extreme &hellip;</li>
                   <li>To burn brightly and fierccely with &hellip;</li>
                   </ul>
                
            </div>
          </div>

        }

        </div>
      </div>
    </div>
  );
}

export default Home;