import React, {useEffect, useState, useMemo} from 'react';
import {Observable, Subject} from 'rxjs';
import {map, buffer, debounceTime, filter, takeUntil} from 'rxjs/operators';

const App = () => {
  const [state, setState] = useState('stop');
  const [time, setTime] = useState(0);
  const [change, setChange] = useState(false);

  const click$ = useMemo(() => new Subject(), []);

  const start = () => {
    setState('start');
    setChange(!change);
  };

  const stop = () => {
    setTime(0);
    setState('stop');
  };

  const reset = () => {
    setTime(0);
    setState('reset');
  };

  const wait = () => {
    click$.next();
  };

  useEffect(() => {
    const doubleClick$ = click$.pipe(
      buffer(click$.pipe(debounceTime(300))),
      map((list) => list.length),
      filter((value) => value >= 2),
    );

    const timer$ = new Observable((observer) => {
      let count = 0;
      const intervalId = setInterval(() => {
        observer.next(count += 1);
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    });

    const subscribtion$ = timer$
      .pipe(takeUntil(doubleClick$))
      .subscribe({
        next: () => {
          if ((state === 'start') || (state === 'reset')) {
            setTime((prev) => prev + 1);
          }
        },
      });

    return (() => {
      subscribtion$.unsubscribe();
    });
  }, [state, change]);

  const setTimeFormat = (totalSecs) => {
    const seconds = (totalSecs % 60);
    const minutes = Math.floor(totalSecs / 60);
    const hours = Math.floor(totalSecs / 3600);
    const hoursFormat = (hours < 1 || hours > 23) ? '00' : (hours >= 1 && hours <= 9) ? `0${hours}` : `${hours}`;
    const minutesFormat = (minutes < 10) ? ((minutes === 0) ? '00' : `0${minutes}`) : `${minutes}`;
    const secondsFormant = (seconds < 10) ? `0${seconds}` : `${seconds}`;
  
    return `${hoursFormat}:${minutesFormat}:${secondsFormant}`;
  };

  return (
    <div className="stopwatch">
      <div>
          <h1>Test Secundomer RXJS</h1>
          <h1>Time: {setTimeFormat(time)}</h1>
      </div>
      <div>
        <div>
          <button className="button" type="button" onClick={start}>Start</button>
          <button type="button" onClick={stop}>Stop</button>
          <button type="button" onClick={reset}>Reset</button>
          <button type="button" onClick={wait}>Wait</button>
        </div>
      </div>
    </div>
  );
};

export default App;
